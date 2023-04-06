
from http import HTTPStatus

from flask import Blueprint
from flask_login import current_user, login_required

from finnance.errors import APIError
from finnance.models import Category, JSONModel

categories = Blueprint('categories', __name__, url_prefix='/api/categories')

@categories.route("/<int:category_id>")
@login_required
def category(category_id):
    # raise APIError(HTTPStatus.UNAUTHORIZED)
    cat = Category.query.filter_by(
        user_id=current_user.id, id=category_id).first()
    if cat is None:
        raise APIError(HTTPStatus.UNAUTHORIZED)
    return cat.api()

@categories.route("")
@login_required
def all_categories():
    categories = Category.query.filter_by(user_id=current_user.id).all()
    return JSONModel.obj_to_api([cat.json(deep=True) for cat in categories])