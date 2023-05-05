
import re
from http import HTTPStatus

from finnance.errors import APIError, validate
from finnance.models import Category, JSONModel
from flask import Blueprint, jsonify
from flask_login import current_user, login_required

from finnance import db

categories = Blueprint('categories', __name__, url_prefix='/api/categories')

@categories.route("/<int:category_id>")
@login_required
def category(category_id):
    cat = Category.query.filter_by(
        user_id=current_user.id, id=category_id).first()
    if cat is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    return cat.api()

def with_parent(parent_id: int | None, is_expense: bool):
    return Category.query.filter_by(
        user_id=current_user.id, parent_id=parent_id, is_expense=is_expense
    ).order_by(
        Category.is_expense, Category.order
    ).all()

def hierarchy(category: Category, json=False):
    return {
        'category': category.json(deep=False) if json else category,
        'children': [
            hierarchy(cat, json=json)
            for cat in with_parent(category.id, category.is_expense)
        ]
    }

def flatten(category, children):
    return [
        dict(id=category.id, desc=category.desc, usable=category.usable,
             parent_desc=category.desc if category.parent_id is None else category.parent.desc),
        *[
            cat for child in children for cat in flatten(**child)
        ]
    ]

def descs(is_expense: bool):
    return [
        flat
        for cat in with_parent(None, is_expense)
        for flat in flatten(**hierarchy(cat))
    ]

@categories.route("/expenses")
@login_required
def expenses_descs():
    return JSONModel.obj_to_api(descs(True))

@categories.route("/incomes")
@login_required
def incomes_descs():
    return JSONModel.obj_to_api(descs(False))
    
@categories.route("/hierarchy/expenses")
@login_required
def expenses_hierarchy():
    return JSONModel.obj_to_api([
        hierarchy(cat, json=True) for cat in with_parent(None, True)
    ])

@categories.route("/hierarchy/incomes")
@login_required
def incomes_hierarchy():
    return JSONModel.obj_to_api([
        hierarchy(cat, json=True) for cat in with_parent(None, False)
    ])

@categories.route("/add", methods=["POST"])
@login_required
@validate({
    "type": "object",
    "properties": {
        "desc": {"type": "string"},
        "is_expense": {"type": "boolean"},
        "color": {"type": "string"},
        "usable": {"type": "boolean"},
        "parent_id": {"type": ["integer", "null"]},
    },
    "required": ["desc", "is_expense", "color", "usable", "parent_id"]
})
def add_category(desc: str, is_expense: bool, color: str, usable: bool, parent_id: int):
    other: Category = Category.query.filter_by(user_id=current_user.id, desc=desc, is_expense=is_expense).first()
    if other is not None:
        raise APIError(HTTPStatus.BAD_REQUEST, "category name already in use")
    
    parent: Category = Category.query.filter_by(user_id=current_user.id, id=parent_id, is_expense=is_expense).first()
    if parent_id is not None and parent is None:
        raise APIError(HTTPStatus.BAD_REQUEST, "invalid parent_id")
    
    if not re.match('^#[a-fA-F0-9]{6}$', color):
        raise APIError(HTTPStatus.BAD_REQUEST, "color: invalid color hex-string")
    
    order = max([
        cat.order for cat in current_user.categories if cat.is_expense == is_expense
        ] + [0]) + 1
    
    category = Category(desc=desc, user_id=current_user.id, usable=usable,
                        color=color, parent_id=parent_id, is_expense=is_expense,
                        order=order)
        
    db.session.add(category)
    db.session.commit()
    return '', HTTPStatus.CREATED

@categories.route("/<int:category_id>/edit", methods=["PUT"])
@login_required
@validate({
    "type": "object",
    "properties": {
        "desc": {"type": "string"},
        "color": {"type": "string"},
        "usable": {"type": "boolean"},
        "parent_id": {"type": ["integer", "null"]},
    }
})
def edit_category(category_id: int, **data):
    category: Category = Category.query.filter_by(user_id=current_user.id, id=category_id).first()
    if category is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    
    changed = False
    if 'desc' in data:
        changed = category.desc != data['desc']
        category.desc = data['desc']
    
    if 'color' in data:
        if not re.match('^#[a-fA-F0-9]{6}$', data['color']):
            raise APIError(HTTPStatus.BAD_REQUEST, "color: invalid color hex-string")
        changed = changed or category.color != data['color']
        category.color = data['color']
    
    if 'usable' in data:
        changed = changed or category.usable != data['usable']
        category.usable = data['usable']

    if 'parent_id' in data:
        changed = changed or category.parent_id != data['parent_id']
        if data['parent_id'] == category.id: 
            raise APIError(HTTPStatus.BAD_REQUEST, "parent_id must not be its own id")
        if data['parent_id'] is not None and Category.query.filter_by(user_id=current_user.id, id=data['parent_id']) is None:
            raise APIError(HTTPStatus.BAD_REQUEST, "invalid parent_id")
        category.parent_id = data['parent_id']

    if not changed:
        raise APIError(HTTPStatus.BAD_REQUEST, "edit request has no changes")
        
    db.session.commit()
    return '', HTTPStatus.CREATED

@categories.route("/orders", methods=["PUT"])
@login_required
@validate({
    "type": "object",
    "properties": {
        "orders": {
            "type": "array",
            "items": {"type": "integer"}
        },
        "ids": {
            "type": "array",
            "items": {"type": "integer"}
        },
        "required": ["orders", "ids"]
    }
})
def edit_category_orders(orders: list[int], ids: list[int]):
    if len(orders) != len(ids):
        raise APIError(HTTPStatus.BAD_REQUEST, "orders and ids must have same length")

    n_changed = 0

    for cat_id, order in zip(ids, orders):
        category: Category = Category.query.filter_by(user_id=current_user.id, id=cat_id).first()
        if category is None:
            raise APIError(HTTPStatus.BAD_REQUEST, "non-existent category id")
        if order < 0:
            raise APIError(HTTPStatus.BAD_REQUEST, "order must be non-negative")
        if category.order == order:
            continue
        n_changed += 1
        category.order = -n_changed

    if n_changed == 0:
        raise APIError(HTTPStatus.BAD_REQUEST, "edit request has no changes")

    for cat_id, order in zip(ids, orders):
        category: Category = Category.query.filter_by(user_id=current_user.id, id=cat_id).first()
        if category.order == order:
            continue
        category.order = order

    db.session.commit()
    return '', HTTPStatus.CREATED
