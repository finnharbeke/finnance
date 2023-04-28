
from datetime import datetime
from http import HTTPStatus

from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
import sqlalchemy

from finnance.errors import APIError
from finnance.models import Agent, Transaction, Record, Category, Currency

nivo = Blueprint('nivo', __name__, url_prefix='/api/nivo')

@nivo.route("/sunburst")
@login_required
def sunburst():
    
    params = request.args.to_dict()
    if 'is_expense' not in params:
        raise APIError(HTTPStatus.BAD_REQUEST, 'is_expense must be in search parameters')
    if params['is_expense'] not in ['true', 'false']:
        raise APIError(HTTPStatus.BAD_REQUEST, "is_expense must be either 'true' or 'false'")
    is_expense = params['is_expense'] == 'true'
    if 'currency_id' not in params:
        raise APIError(HTTPStatus.BAD_REQUEST, 'currency_id must be in search parameters')
    try:
        c_id = int(params['currency_id'])
    except ValueError:
        raise APIError(HTTPStatus.BAD_REQUEST, 'currency_id must be integer')
    currency = Currency.query.filter_by(id=c_id).first()
    if currency is None:
        raise APIError(HTTPStatus.BAD_REQUEST, "invalid currency_id")
    min_date = None
    if 'min_date' in params:
        try:
            min_date = datetime.fromisoformat(params['min_date'])
        except ValueError:
            raise APIError(HTTPStatus.BAD_REQUEST, "min_date: invalid iso format")
    max_date = None
    if 'max_date' in params:
        try:
            max_date = datetime.fromisoformat(params['max_date'])
        except ValueError:
            raise APIError(HTTPStatus.BAD_REQUEST, "max_date: invalid iso format")

    def agents(cat, path):
        query = Agent.query.join(Transaction).join(Record).join(Category
            ).filter(Transaction.currency_id == currency.id).filter(Category.id == cat.id)
        if min_date is not None:
            query = query.filter(Transaction.date_issued >= min_date)
        if max_date is not None:
            query = query.filter(Transaction.date_issued < max_date)
        query = query.group_by(Agent).with_entities(
                sqlalchemy.func.sum(Record.amount).label('value'), 
                Agent.desc.label('name')
            )
        return [
            dict(
                color=cat.color,
                id=f'{path}.{row._asdict()["name"]}',
                **row._asdict()
            )
            for row in query
        ]

    def cat_obj(cat: Category, inside=False, path=''):
        cat_children = Category.query.filter_by(parent_id=cat.id).order_by(Category.order).all()
        path = f'{path}.{cat.desc}'
        if len(cat_children) == 0 or inside:
            children = agents(cat, path)
        else:
            children = [
                cat_obj(ch, path=path) for ch in cat_children
            ] + [cat_obj(cat, inside=True, path=path)]
        return {
            'id': path,
            'name': cat.desc,
            'color': cat.color,
            'children': children,
        }

    data = []
    for cat in Category.query.filter_by(parent_id=None, user_id=current_user.id, is_expense=is_expense
                                        ).order_by(Category.order):
        data.append(cat_obj(cat))
    return jsonify({'id': 'sunburst', 'color': '#ff0000', 'children': data})