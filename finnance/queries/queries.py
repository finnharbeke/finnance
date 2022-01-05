from flask import Blueprint, render_template, abort, request
from flask_login import login_required, current_user
from finnance.main.controllers import dated_url_for, params
from finnance.models import Account, Category, Currency, Record, Transaction, Flow, Agent, AccountTransfer
import datetime as dt

queries = Blueprint('queries', __name__, template_folder='templates',
    static_folder='static', static_url_path='/static/queries')

def clear_argsdict(d: dict):
    for key, val in list(d.items()):
        if val == '':
            d.pop(key)
    return d

@queries.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

@queries.route("/accounts/<int:account_id>/changes")
@login_required
def account_changes(account_id):
    account = Account.query.get(account_id)
    if account is None or current_user.id != account.user_id:
        return abort(404)
    changes, saldos = account.changes()
    return render_template("changes.j2", account=account,
        saldos=saldos, changes=changes, **params())

def trans_filter(query=None, **req):
    query = Transaction.query.join(Currency) if query is None else query
    query = query.filter(Transaction.user_id==current_user.id)
    if 'currency_id' in req:
        curr = Currency.query.get(req.get('currency_id'))
        if curr is not None:
            query = query.filter(Transaction.currency_id == curr.id)
        else:
            query = query.filter(False)
            
    if 'start' in req:
        try:
            start = req.get('start')
            start = dt.datetime.fromisoformat(start) if type(start) != dt.datetime else start
            query = query.filter(Transaction.date_issued >= start)
        except ValueError:
            query = query.filter(False)
    if 'end' in req:
        try:
            end = req.get('end')
            end = dt.datetime.fromisoformat(end) if type(end) != dt.datetime else end
            query = query.filter(Transaction.date_issued < end)
        except ValueError:
            query = query.filter(False)
    if 'expense' in req:
        try:
            is_exp = bool(req.get('expense'))
            query = query.filter(Transaction.is_expense == is_exp)
        except ValueError:
            query = query.filter(False)
    
    if 'remote' in req:
        rem = bool(req.get('remote')) if 'remote' in req not in ['false', 'False', '0'] else False
        if rem:
            query = query.filter(Transaction.account_id == None)
        else:
            query = query.filter(Transaction.account_id != None)

    query = query.order_by(Transaction.date_issued)
    return query

def record_filter(query=None, **req):
    query = Record.query.join(Transaction).join(Category).join(Currency) if query is None else query
    query = trans_filter(query=query, **req)
    if 'category_id' in req:
        cat = Category.query.get(req.get('category_id'))
        if cat is not None:
            query = query.filter(Category.id == cat.id)
        else:
            query = query.filter(False)
    if 'min' in req:
        try:
            min_ = float(req.get('min'))
            query = query.filter(Record.amount >= min_)
        except ValueError:
            query = query.filter(False)
    if 'max' in req:
        try:
            max_ = float(req.get('max'))
            query = query.filter(Record.amount <= max_)
        except ValueError:
            query = query.filter(False)
    return query

def flow_filter(query=None, **req):
    query = Flow.query.join(Agent, Flow.agent_id == Agent.id).join(
        Transaction, Flow.trans_id == Transaction.id).join(Currency) if query is None else query
    query = trans_filter(query=query, **req)
    if 'agent' in req:
        agent = Agent.query.filter_by(desc=req.get('agent')).first()
        if agent is None:
            query = query.filter(False)
        else:
            query = query.filter(Flow.agent_id == agent.id)
    if 'min' in req:
        try:
            min_ = float(req.get('min'))
            query = query.filter(Flow.amount >= min_)
        except ValueError:
            query = query.filter(False)
    if 'max' in req:
        try:
            max_ = float(req.get('max'))
            query = query.filter(Flow.amount <= max_)
        except ValueError:
            query = query.filter(False)
    return query

def account_filter(query=None, **req):
    query = Account.query if query is None else query
    query = query.filter(Account.user_id == current_user.id)
    if 'currency_id' in req:
        curr = Currency.query.get(req.get('currency_id'))
        if curr is not None:
            query = query.filter(Account.currency_id == curr.id)
        else:
            query = query.filter(False)
    
    query = query.order_by(Account.order)
    return query

def transfer_filter(query=None, **req):
    query = AccountTransfer.query if query is None else query
    query = query.filter(AccountTransfer.user_id == current_user.id)
    query = query.order_by(AccountTransfer.date_issued)
    return query

def category_filter(query=None, descending=False, **req):
    query = Category.query if query is None else query
    query = query.filter(Category.user_id == current_user.id)
    if 'is_expense' in req:
        is_exp = bool(req.get('is_expense'))
        if 'is_expense' in req in ['0', 'false', 'False']:
            is_exp = False
        query = query.filter(Category.is_expense == is_exp)
    if 'parent_id' in req:
        parid = req.get('parent_id')
        if type(parid) is str:
            if parid in ['none', 'None', 'null']:
                parid = None
            try:
                parid = int(parid)
            except ValueError:
                query = query.filter(False)
        query = query.filter(Category.parent_id == parid)
    if not descending:
        query = query.order_by(Category.is_expense.desc(), Category.order)
    else:
        query = query.order_by(Category.is_expense.desc(), Category.order.desc())

    return query

@queries.route("/records")
@login_required
def records():
    req = clear_argsdict(request.args.to_dict())
    records = record_filter(**req)
    return render_template("records.j2", records=records, **params())

@queries.route("/flows")
@login_required
def flows():
    req = clear_argsdict(request.args.to_dict())
    flows = flow_filter(**req)
    s = 0
    sums = []
    for f in flows:
        s += -f.amount if f.is_debt else f.amount
        sums.append(round(s, f.trans.currency.decimals))
    return render_template("flows.j2", flows=flows, sums=sums, **params())