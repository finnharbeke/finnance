from datetime import datetime
from http import HTTPStatus
from math import ceil

from finnance.agents import create_agent_ifnx
from finnance.errors import APIError, validate
from finnance.models import (Account, Category, Currency, Flow, Record,
                             Transaction, JSONModel)
from finnance.params import parseSearchParams, ModelID
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

from finnance import db

transactions = Blueprint('transactions', __name__, url_prefix='/api/transactions')

@transactions.route("/<int:transaction_id>")
@login_required
def transaction(transaction_id: int):
    trans = Transaction.query.filter_by(id=transaction_id, user_id=current_user.id).first()
    if trans is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    return trans.api()

@transactions.route("")
@login_required
def get_transactions():
    kwargs = parseSearchParams(request.args.to_dict(), dict(
        start=datetime, end=datetime, account_id=ModelID, search=str
    ))

    result = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.date_issued.desc())
    if 'start' in kwargs:
        result = result.filter(Transaction.date_issued >= kwargs.get('start'))
    if 'end' in kwargs:
        result = result.filter(Transaction.date_issued < kwargs.get('end'))
    if 'account_id' in kwargs:
        result = result.filter_by(account_id=kwargs['account_id'].id)
    
    pagesize = kwargs.get('pagesize')
    page = kwargs.get('page')

    # search filter
    result = list(filter(
        lambda t: 'search' not in kwargs or any(
            kwargs['search'].lower() in string for string in [
                t.comment.lower(),
                t.agent.desc.lower(),
                t.account.desc.lower() if t.account_id is not None else t.flows[0].agent_desc
        ]),
        result.all()
    ))
    return JSONModel.obj_to_api(dict(
        pages= ceil(len(result) / pagesize),
        transactions=[
        trans.json(deep=True)
        for trans in result[pagesize*page:pagesize*(page+1)]
    ]))

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
        "direct": {"type": "boolean"},
        "remote_agent": {"type": "string"},
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
    },
    "required": ["currency_id", "amount", "date_issued", "is_expense", "agent", "comment", "direct", "flows", "records"]
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
    
    if 'remote_agent' in data and len(data['remote_agent']):
        flows = [{
            'agent': data['remote_agent'],
            'is_debt': data['is_expense'],
            'amount': data['amount']
        }]
    elif data['direct']:
        flows = [{
            'agent': agent.desc,
            'is_debt': not data['is_expense'],
            'amount': data['amount']
        }]
    else:
        flows = data['flows']
        for flow in flows:
            flow['is_debt'] = not data['is_expense']

    data.pop('direct')
    data.pop('remote_agent', 0) # not necessarily included
    data.pop('flows')

    for flow in flows:
        flow['agent_id'] = create_agent_ifnx(flow.pop('agent')).id

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
        "remote_agent": {"type": "string"},
        "direct": {"type": "boolean"},
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
        account = Account.query.filter_by(id=data['account_id'], user_id=current_user.id).first()
        if account is None:
            raise APIError(HTTPStatus.BAD_REQUEST, 'invalid account_id')
        if 'currency_id' in data and account.currency_id != data['currency_id']:
            raise APIError(HTTPStatus.BAD_REQUEST, 'account and currency don\'t match')

        trans.account_id = account.id
        trans.currency_id = account.currency_id

    if 'currency_id' in data and data['currency_id'] != trans.currency_id:
        currency = Currency.query.filter_by(id=data['currency_id'], user_id=current_user.id).first()
        if currency is None:
            raise APIError(HTTPStatus.BAD_REQUEST, 'invalid currency_id')
        
        trans.currency_id = currency.id

    agent = None
    if 'agent' in data and data['agent'] != trans.agent.desc:
        agent = create_agent_ifnx(data.pop('agent'))
        db.session.commit()
        trans.agent_id = agent.id
    
    if 'comment' in data and data['comment'] != trans.comment:
        trans.comment = data['comment']
    
    is_expense = trans.is_expense
    if 'is_expense' in data and data['is_expense'] != trans.is_expense:

        is_expense = data['is_expense']
        trans.is_expense = is_expense
    
    if 'amount' in data and data['amount'] != trans.amount:
        trans.amount = data['amount']
    
    flows = None
    if 'remote_agent' in data and len(data['remote_agent']):
        flows = [{
            'agent': data['remote_agent'],
            'is_debt': data['is_expense'],
            'amount': data['amount']
        }]
    elif 'direct' in data and data['direct']:
        flows = [{
            'agent': agent.desc if agent is not None else trans.agent.desc,
            'is_debt': not data['is_expense'],
            'amount': data['amount']
        }]
    elif 'flows' in data:
        flows = data['flows']
        for flow in flows:
            flow['is_debt'] = not data['is_expense']

    data.pop('direct', 0)
    data.pop('remote_agent', 0)
    data.pop('flows', 0)
    
    if flows is not None:
        for flow_data, flow in zip(flows, trans.flows):
            agent = create_agent_ifnx(flow_data['agent'])
            flow.agent_id = agent.id
            flow.is_debt = flow_data['is_debt']
            flow.amount = flow_data['amount']

        for flow in trans.flows[len(flows):]:
            db.session.delete(flow)
        
        for flow_data in flows[len(trans.flows):]:
            flow = Flow(
                agent_id = create_agent_ifnx(flow_data.pop('agent')).id,
                is_debt = flow_data['is_debt'],
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

@transactions.route("/<int:transaction_id>/delete", methods=["DELETE"])
@login_required
def delete_transaction(transaction_id: int):
    trans = Transaction.query.filter_by(user_id=current_user.id, id=transaction_id).first()
    if trans is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    
    for flow in trans.flows:
        db.session.delete(flow)
    for rec in trans.records:
        db.session.delete(rec)
    db.session.delete(trans)
    db.session.commit()

    return '', HTTPStatus.OK