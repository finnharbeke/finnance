from datetime import datetime
from http import HTTPStatus

from finnance.agents import create_agent_ifnx
from finnance.errors import APIError, validate
from finnance.models import (Account, Agent, Category, Currency, Flow, Record,
                             Transaction)
from flask import Blueprint, Response, jsonify
from flask_login import current_user, login_required

from finnance import db

transactions = Blueprint('transactions', __name__, url_prefix='/api/transactions')

@transactions.route("/<int:transaction_id>")
@login_required
def transaction(transaction_id: int):
    trans = Transaction.query.filter_by(id=transaction_id).first()
    if trans is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    return trans.api()

@transactions.route("/add", methods=["POST"])
@login_required
@validate({
    "type": "object",
    "properties": {
        "account_id": {"type": "integer"},
        "currency_id": {"type": "integer"},
        "amount": {"type": "integer"},
        "date_issued": {"type": "string"},
        "is_expense": {"type": "boolean"},
        "agent": {"type": "string"},
        "comment": {"type": "string"},
        "flows": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "amount": {"type": "integer"},
                    "agent": {"type": "string"},
                },
                "required": ["amount", "agent"]
            }
        },
        "records": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "amount": {"type": "integer"},
                    "category_id": {"type": "integer"},
                },
                "required": ["amount", "category_id"]
            }
        },
        "remote_agent": {"type": "string"}
    },
    "required": ["currency_id", "amount", "date_issued", "is_expense", "agent", "comment", "flows", "records"]
})
def add_trans(**data):
    data['date_issued'] = datetime.fromisoformat(data.pop('date_issued'))

    if 'account_id' in data:
        account = Account.query.filter_by(id=data['account_id'], user_id=current_user.id).first()
        if account is None:
            raise APIError(HTTPStatus.BAD_REQUEST, 'invalid account_id')
        if account.currency_id != data['currency_id']:
            raise APIError(HTTPStatus.BAD_REQUEST, 'account and currency don\'t match')
        data['currency_id'] = account.currency_id

    else: # 'currency_id' in data:
        currency = Currency.query.filter_by(id=data['currency_id'], user_id=current_user.id)
        if currency is None:
            raise APIError(HTTPStatus.BAD_REQUEST, 'invalid currency_id')
    
    records = data.pop('records')
    for record in records:
        cat = Category.query.filter_by(user_id=current_user.id, id=record['category_id']).first()
        if cat is None:
            raise APIError(HTTPStatus.BAD_REQUEST, 'invalid category_id')
    # AGENTs
    agent = create_agent_ifnx(data.pop('agent'))
    data['agent_id'] = agent.id
    
    if 'remote_agent' in data:
        flows = [{
            'agent': data.pop('remote_agent'),
            'is_debt': data['is_expense'],
            'amount': data['amount']
        }]
    else:
        flows = data.pop('flows')

    for flow in flows:
        flow['agent_id'] = create_agent_ifnx(flow.pop('agent')).id
        flow['is_debt'] = not data['is_expense']
    

    trans = Transaction(**data, user_id=current_user.id)
    db.session.add(trans)
    db.session.commit()
    for record in records:
        db.session.add(
            Record(**record, trans_id=trans.id)
        )
    for flow in flows:
        db.session.add(
            Flow(**flow, trans_id=trans.id)
        )
    db.session.commit()
        
    return '', HTTPStatus.CREATED

@transactions.route("/<int:transaction_id>/edit", methods=["PUT"])
@login_required
@validate({
    "type": "object",
    "properties": {
        "account_id": {"type": "integer"},
        "currency_id": {"type": "integer"},
        "amount": {"type": "integer"},
        "date_issued": {"type": "string"},
        "is_expense": {"type": "boolean"},
        "agent": {"type": "string"},
        "comment": {"type": "string"},
        "flows": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "amount": {"type": "integer"},
                    "agent": {"type": "string"},
                },
                "required": ["amount", "agent"]
            }
        },
        "records": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "amount": {"type": "integer"},
                    "category_id": {"type": "integer"},
                },
                "required": ["amount", "category_id"]
            }
        },
        "remote_agent": {"type": "string"}
    }
})
def edit_transaction(transaction_id: int, **data):
    trans = Transaction.query.filter_by(user_id=current_user.id, id=transaction_id).first()
    if trans is None:
        raise APIError(HTTPStatus.NOT_FOUND)

    if 'date_issued' in data:
        issued = datetime.fromisoformat(data.pop('date_issued'))
        if issued != trans.date_issued:
            trans.date_issued = issued

    if 'account_id' in data and data['account_id'] != trans.account_id:
        account = Account.query.filter_by(id=data['account_id'], user_id=current_user.id)
        if account is None:
            raise APIError(HTTPStatus.BAD_REQUEST, 'invalid account_id')
        if 'currency_id' in data and account.currency_id != data['currency_id']:
            raise APIError(HTTPStatus.BAD_REQUEST, 'account and currency don\'t match')

        trans.account_id = account.id
        trans.currency_id = account.currency_id

    if 'currency_id' in data and data['currency_id'] != trans.currency_id:
        currency = Currency.query.filter_by(id=data['currency_id'], user_id=current_user.id)
        if currency is None:
            raise APIError(HTTPStatus.BAD_REQUEST, 'invalid currency_id')
        
        trans.currency_id = currency.id

    if 'agent' in data and data['agent'] != trans.agent.desc:
        agent = create_agent_ifnx(data.pop('agent'))
        db.session.commit()
        trans.agent_id = agent.id
    
    if 'comment' in data and data['comment'] != trans.comment:
        trans.comment = data['comment']
    
    changed_exp = False
    is_expense = trans.is_expense
    if 'is_expense' in data and data['is_expense'] != trans.is_expense:
        changed_exp = True

        is_expense = data['is_expense']
        trans.is_expense = is_expense
    
    if 'amount' in data and data['amount'] != trans.amount:
        trans.amount = data['amount']
    
    flows = None
    if 'remote_agent' in data:
        flows = [{
            'agent': data.pop('remote_agent'),
            'is_debt': data['is_expense'],
            'amount': data['amount']
        }]
    elif 'flows' in data:
        flows = data['flows']
    
    if flows is not None:
        for flow_data, flow in zip(flows, trans.flows):
            if changed_exp or flow_data['agent'] != flow.agent.desc or flow_data['amount'] != flow.amount:
                
                agent = create_agent_ifnx(flow_data['agent'])
                flow.agent_id = agent.id
                flow.is_debt = not data['is_expense']
                flow.amount = flow_data['amount']

        for flow in trans.flows[len(flows):]:
            db.session.delete(flow)
        
        for flow_data in flows[len(trans.flows):]:
            flow = Flow(
                agent_id = create_agent_ifnx(flow_data.pop('agent')).id,
                is_debt = not is_expense,
                amount = flow_data['amount'],
                trans_id = transaction_id
            )
            db.session.add(flow)
    
    if 'records' in data:
        for rec_data, rec in zip(data['records'], trans.records):
            if rec_data['category_id'] != rec.category.id or rec_data['amount'] != rec.amount:
                
                cat = Category.query.filter_by(user_id=current_user.id, id=rec_data['category_id']).first()
                if cat is None:
                    raise APIError(HTTPStatus.BAD_REQUEST, 'invalid category_id')
                
                rec.category_id = cat.id
                rec.amount = rec_data['amount']

        for rec in trans.records[len(data['records']):]:
            db.session.delete(rec)
        
        for rec_data in data['records'][len(trans.records):]:
            cat = Category.query.filter_by(user_id=current_user.id, id=rec_data['category_id']).first()
            if cat is None:
                raise APIError(HTTPStatus.BAD_REQUEST, 'invalid category_id')

            rec = Record(
                category_id = cat.id,
                amount = rec_data['amount'],
                trans_id = transaction_id
            )
            db.session.add(rec)

    db.session.commit()
        
    return '', HTTPStatus.CREATED