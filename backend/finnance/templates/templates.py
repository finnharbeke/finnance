from datetime import datetime
from http import HTTPStatus

from finnance.agents import create_agent_ifnx
from finnance.errors import APIError, validate
from finnance.models import (Account, Category, Currency, FlowTemplate,
                             JSONModel, RecordTemplate, TransactionTemplate)
from flask import Blueprint, jsonify
from flask_login import current_user, login_required

from finnance import db

templates = Blueprint('templates', __name__, url_prefix='/api/templates')

@templates.route("")
@login_required
def all_templates():
    temps = TransactionTemplate.query.filter_by(
        user_id=current_user.id).order_by(TransactionTemplate.order.asc()).all()
    return JSONModel.obj_to_api([temp.json(deep=True) for temp in temps])

@templates.route("/add", methods=["POST"])
@login_required
@validate({
    "type": "object",
    "properties": {
        "desc": {"type": "string"},
        "account_id": {"type": "integer"},
        "currency_id": {"type": "integer"},
        "amount": {"type": "integer"},
        "is_expense": {"type": "boolean"},
        "direct": {"type": "boolean"},
        "agent": {"type": "string"},
        "comment": {"type": "string"},
        "remote_agent": {"type": "string"},
        "flows": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "amount": {"type": "integer"},
                    "agent": {"type": "string"},
                    "ix": {"type": "integer"}
                },
                "required": ["ix"]
            }
        },
        "records": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "amount": {"type": "integer"},
                    "category_id": {"type": "integer"},
                    "ix": {"type": "integer"}
                },
                "required": ["ix"]
            }
        },
    },
    "required": ["desc", "is_expense", "direct", "comment"]
})
def add_template(**data):
    if 'account_id' in data:
        account = Account.query.filter_by(id=data['account_id'], user_id=current_user.id).first()
        if account is None:
            raise APIError(HTTPStatus.BAD_REQUEST, 'invalid account_id')
        if 'currency_id' in data and account.currency_id != data['currency_id']:
            raise APIError(HTTPStatus.BAD_REQUEST, 'account and currency don\'t match')

    if 'currency_id' in data:
        currency = Currency.query.filter_by(id=data['currency_id'], user_id=current_user.id)
        if currency is None:
            raise APIError(HTTPStatus.BAD_REQUEST, 'invalid currency_id')
    
    records = data.pop('records')
    for record in records:
        if 'category_id' not in record:
            continue
        cat = Category.query.filter_by(user_id=current_user.id, id=record['category_id']).first()
        if cat is None:
            raise APIError(HTTPStatus.BAD_REQUEST, 'invalid category_id')
    
    if 'agent' in data:
        agent = create_agent_ifnx(data.pop('agent'))
        data['agent_id'] = agent.id
    
    if 'remote_agent' in data:
        agent = create_agent_ifnx(data.pop('remote_agent'))
        data['remote_agent_id'] = agent.id
        flows = []
    else:
        flows = data.pop('flows')

    for flow in flows:
        flow['agent_id'] = create_agent_ifnx(flow.pop('agent')).id if 'agent' in flow else None

    order = max([temp.order for temp in current_user.templates] + [0]) + 1
    temp = TransactionTemplate(**data, user_id=current_user.id, order=order)
    db.session.add(temp)
    db.session.commit()
    for record in records:
        db.session.add(
            RecordTemplate(**record, template_id=temp.id)
        )
    for flow in flows:
        db.session.add(
            FlowTemplate(**flow, template_id=temp.id)
        )
    db.session.commit()
        
    return '', HTTPStatus.CREATED

@templates.route("/<int:template_id>/delete", methods=["DELETE"])
@login_required
def delete_template(template_id: int):
    temp = TransactionTemplate.query.filter_by(user_id=current_user.id, id=template_id).first()
    if temp is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    
    for record in temp.records:
        db.session.delete(record)
    for flow in temp.flows:
        db.session.delete(flow)

    db.session.delete(temp)
    db.session.commit()

    return jsonify({}), HTTPStatus.OK