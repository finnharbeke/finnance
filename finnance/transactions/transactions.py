from datetime import datetime
from http import HTTPStatus

from flask import Blueprint, jsonify
from flask_login import current_user, login_required

from finnance import db
from finnance.errors import APIError, validate
from finnance.models import Account, Agent, Flow, Record, Transaction

transactions = Blueprint('transactions', __name__, url_prefix='/api/transactions')

@transactions.route("/add", methods=["POST"])
@login_required
@validate({
    "type": "object",
    "properties": {
        "account_id": {"type": "number"},
        "amount": {"type": "number"},
        "date_issued": {"type": "string"},
        "is_expense": {"type": "boolean"},
        "agent": {"type": "string"},
        "comment": {"type": "string"},
        "flows": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "amount": {"type": "number"},
                    "agent": {"type": "string"},
                }
            }
        },
        "records": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "amount": {"type": "number"},
                    "category_id": {"type": "number"},
                }
            }
        },
    },
    "required": ["amount", "date_issued", "is_expense", "agent", "comment", "flows", "records"]
})
def add_trans(**data):
    data['date_issued'] = datetime.fromisoformat(data.pop('date_issued'))

    if data['account_id']:
        account = Account.query.get(data['account_id'])
        if account.user_id != current_user.id:
            raise APIError(HTTPStatus.NOT_FOUND)
        # check saldo
        saldo = account.saldo
        # TODO: saldo at date_issued
        diff = -data['amount'] if data['is_expense'] else data['amount']
        # if edit is None:
        # else:
        #     tr = Transaction.query.get(edit)
        #     diff = tr.amount if tr.is_expense else -tr.amount
        #     diff += -data['amount'] if data['is_expense'] else data['amount']

        if saldo + diff < 0:
            raise APIError(HTTPStatus.BAD_REQUEST,
                               "Transaction results in negative Account Saldo!")

        data['currency_id'] = account.currency_id

    def agent_createif(agent_desc):
        if agent_desc is None:
            return None
        agent = Agent.query.filter_by(desc=agent_desc).first()
        if not agent:
            agent = Agent(desc=agent_desc, user_id=current_user.id)
            db.session.add(agent)
            db.session.commit()
        return agent
    
    # AGENTs
    agent = agent_createif(data.pop('agent'))
    data['agent_id'] = agent.id
    # remote_agent = agent_createif(data.pop('remote_agent'))
    
    flows = data.pop('flows')

    for flow in flows:
        flow['agent_id'] = agent_createif(flow.pop('agent')).id
        flow['is_debt'] = not data['is_expense']
    
    records = data.pop('records')

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
        
    return jsonify({
        "success": True
    })