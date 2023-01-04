from flask import Blueprint, request, redirect, url_for, abort, jsonify
import datetime as dt
from sqlalchemy import func
from finnance import db
from finnance.models import AccountTransfer, Transaction, Agent, Record, Flow, Account
from finnance.main.controllers import dated_url_for
from flask_login import login_required, current_user

creation = Blueprint('creation', __name__, static_url_path='/static/creation',
    static_folder='static', template_folder='templates')

@creation.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

@creation.route("/transactions/add", methods=["POST"])
@login_required
def add_trans():
    success, result = parseRequest(request)
    if not success:
        return result
    else:
        trans, records, flows = result
        trans = Transaction(**trans, user_id=current_user.id)
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
        
    return "New Transaction successfully created!", 201

@creation.route("/transactions/edit/<int:transaction_id>", methods=["PUT"])
@login_required
def edit_trans(transaction_id):
    success, result = parseRequest(request, edit=transaction_id)
    if not success:
        return result
    else:
        old = Transaction.query.get(transaction_id)
        if old.user_id != current_user.id:
            return False, ("User not authenticated for account", 409)
        trans, records, flows = result
        for key, value in trans.items():
            setattr(old, key, value)
        for rec in old.records:
            db.session.delete(rec)
        db.session.commit()
        for rec in records:
            db.session.add(
                Record(**rec, trans_id=old.id)
            )
        for flow in old.flows:
            db.session.delete(flow)
        db.session.commit()
        for flow in flows:
            db.session.add(
                Flow(**flow, trans_id=old.id)
            )
        db.session.commit()
        return "Transaction successfully changed!", 200

@creation.route("/transactions/edit_info/<int:transaction_id>")
@login_required
def trans_edit_info(transaction_id):
    trans = Transaction.query.get(transaction_id)
    if trans.user_id != current_user.id:
        abort(404)
    direct_flow = len(trans.records) == 0 and (
        len(trans.flows) == 1 and trans.flows[0].agent_id == trans.agent_id)
    return jsonify({
        'trans': {
            'account_id': trans.account_id,
            'account_desc': trans.account.desc if trans.account_id is not None else None,
            'currency_id': trans.currency_id,
            'date_issued': trans.date_issued.isoformat(),
            'amount': trans.amount,
            'comment': trans.comment,
            'is_expense': trans.is_expense,
            'agent': trans.agent.desc,
            'direct_flow': direct_flow,
            'remote_agent': trans.flows[0].agent.desc if trans.account_id is None else None,
            'user_id': trans.user_id
        },
        'flows': [] if direct_flow or trans.account_id is None else [{
            'agent': flow.agent.desc,
            'amount': flow.amount
        } for flow in trans.flows],
        'records': [{
            'category_id': record.category_id,
            'amount': record.amount
        } for record in trans.records]
    })

def parseRequest(request, edit=None):
    trans = request.json

    trans['date_issued'] = dt.datetime.fromisoformat(trans.pop('date_issued'))

    if trans['account_id']:
        account = Account.query.get(trans['account_id'])
        if account.user_id != current_user.id:
            return False, ("User not authorized to account", 409)
        # check saldo
        saldo = account.saldo
        if edit is None:
            diff = -trans['amount'] if trans['is_expense'] else trans['amount']
        else:
            tr = Transaction.query.get(edit)
            diff = tr.amount if tr.is_expense else -tr.amount
            diff += -trans['amount'] if trans['is_expense'] else trans['amount']

        if saldo + diff < 0:
            return False, ("Transaction results in negative Account Saldo!", 409)
    
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
    agent = agent_createif(trans.pop('agent'))
    trans['agent_id'] = agent.id
    remote_agent = agent_createif(trans.pop('remote_agent'))
    
    flows = trans.pop('flows')

    for flow in flows:
        flow['agent_id'] = agent_createif(flow.pop('agent')).id
        flow['is_debt'] = not trans['is_expense']


    # DIRECT_FLOW
    if trans['directflow'] or remote_agent is not None:
        flows.append({
            'amount': trans['amount'],
            'is_debt':
                not trans['is_expense'] if trans['directflow'] else trans['is_expense'],
            'agent_id': agent.id if trans['directflow'] else remote_agent.id
        })
    
    trans.pop('directflow')
    records = trans.pop('records')
    return True, (trans, records, flows)

@creation.route("/transfers/add/<int:src_id>-<int:dst_id>", methods=["POST"])
@login_required
def add_transfer(src_id, dst_id):
    src = Account.query.get(src_id)
    dst = Account.query.get(dst_id)
    if src.user_id != current_user.id or dst.user_id != current_user.id:
        abort(409)
    src_amount = float(request.form.get("src_amount"))
    saldo = src.saldo
    if saldo - src_amount < 0:
        return abort(409)
    dst_amount = float(request.form.get("dst_amount"))
    date_issued = dt.datetime.strptime(request.form.get("date_issued"), Transaction.input_format)
    if date_issued < src.date_created or date_issued < dst.date_created:
        return abort(409)
    if date_issued > dt.datetime.now():
        return abort(409)

    comment = request.form.get('comment')

    db.session.add(AccountTransfer(src_id=src_id, dst_id=dst_id, src_amount=src_amount,
        dst_amount=dst_amount, date_issued=date_issued, comment=comment, user_id=current_user.id))
    db.session.commit()
    return redirect(url_for('main.home'))

@creation.route("/accounts/add", methods=["POST"])
@login_required
def add_account():
    desc = request.form.get("description")
    starting_saldo = float(request.form.get("starting_saldo"))
    date_created = dt.datetime.strptime(
        request.form.get("date_created"), "%d.%m.%Y"
    )
    if date_created > dt.datetime.now():
        return abort(409)
    currency_id = int(request.form.get("currency"))
    color = request.form.get("color")
    max_order, = db.session.query(func.max(Account.order)).filter_by(user_id=current_user.id).first()
    max_order = 0 if max_order is None else max_order
    account = Account(desc=desc, starting_saldo=starting_saldo, order=max_order + 1, color=color,
        date_created=date_created, currency_id=currency_id, user_id=current_user.id)
    db.session.add(account)
    db.session.commit()
    return redirect(url_for('main.account', account_id=account.id))