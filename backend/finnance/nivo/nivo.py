
from http import HTTPStatus

from flask import Blueprint, jsonify
from flask_login import current_user, login_required
import sqlalchemy

from finnance import db
from finnance.errors import APIError, validate
from finnance.models import Agent, Transaction, Record, Category, JSONModel

nivo = Blueprint('nivo', __name__, url_prefix='/api/nivo')

@nivo.route("/sunburst")
@login_required
def sunburst():
    def agents(cat):
        return [
            dict(
                color=cat.color,
                **row._asdict()
            )
        for row in Agent.query.join(Transaction).join(Record).join(Category
            ).filter(Category.id == cat.id).group_by(Agent).with_entities(
                sqlalchemy.func.sum(Record.amount).label('value'), 
                Agent.desc.label('id')
            )
        ]

    def cat_obj(cat: Category, inside=False, path=''):
        cat_children = Category.query.filter_by(parent_id=cat.id).order_by(Category.order).all()
        if len(cat_children) == 0 or inside:
            children = agents(cat)
        else:
            children = [
                cat_obj(ch) for ch in cat_children
            ] + [cat_obj(cat, inside=True)]
        return {
            'id': cat.desc,
            'color': cat.color,
            'children': children,
        }

    data = []
    for cat in Category.query.filter_by(parent_id=None, user_id=current_user.id, is_expense=True
                                        ).order_by(Category.order):
        data.append(cat_obj(cat))
    return jsonify({'id': 'sunburst', 'color': '#ff0000', 'children': data})