from flask import Blueprint, render_template, abort, request
from finnance.main.controllers import dated_url_for, params
from finnance.models import Account, Category, Currency, Record, Transaction, Flow, Agent
import datetime as dt

queries = Blueprint('queries', __name__, template_folder='templates',
    static_folder='static', static_url_path='/static/queries')

@queries.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

@queries.route("/accounts/<int:account_id>/changes")
def account_changes(account_id):
    account = Account.query.get(account_id)
    if account is None:
        return abort(404)
    changes, saldos = account.changes()
    return render_template("changes.j2", account=account,
        saldos=saldos, changes=changes, **params())

def trans_filter(query, req: dict):
    if req.get('currency_id'):
        curr = Currency.query.get(req.get('currency_id'))
        if curr is not None:
            query = query.filter(Transaction.currency_id == curr.id)
        else:
            query = query.filter(False)
            
    if req.get('start'):
        try:
            start = dt.datetime.fromisoformat(req.get('start'))
            query = query.filter(Transaction.date_issued >= start)
        except ValueError:
            query = query.filter(False)
    if req.get('end'):
        try:
            end = dt.datetime.fromisoformat(req.get('end'))
            query = query.filter(Transaction.date_issued <= end)
        except ValueError:
            query = query.filter(False)
    if req.get('expense'):
        try:
            is_exp = bool(req.get('expense'))
            query = query.filter(Transaction.is_expense == is_exp)
        except ValueError:
            query = query.filter(False)

    query = query.order_by(Transaction.date_issued)
    return query

def record_filter(query, req: dict):
    query = trans_filter(query, req)
    if req.get('category_id'):
        cat = Category.query.get(req.get('category_id'))
        if cat is not None:
            query = query.filter(Category.id == cat.id)
        else:
            query = query.filter(False)
    if req.get('min'):
        try:
            min_ = float(req.get('min'))
            query = query.filter(Record.amount >= min_)
        except ValueError:
            query = query.filter(False)
    if req.get('max'):
        try:
            max_ = float(req.get('max'))
            query = query.filter(Record.amount <= max_)
        except ValueError:
            query = query.filter(False)
    return query

def flow_filter(query, req: dict):
    query = trans_filter(query, req)
    if req.get('agent'):
        agent = Agent.query.filter_by(desc=req.get('agent')).first()
        if agent is None:
            query = query.filter(False)
        else:
            query = query.filter(Flow.agent_id == agent.id)
    if req.get('min'):
        try:
            min_ = float(req.get('min'))
            query = query.filter(Flow.amount >= min_)
        except ValueError:
            query = query.filter(False)
    if req.get('max'):
        try:
            max_ = float(req.get('max'))
            query = query.filter(Flow.amount <= max_)
        except ValueError:
            query = query.filter(False)
    return query

@queries.route("/records")
def records():
    records = Record.query.join(Category).join(Transaction)
    req = request.args.to_dict()
    records = record_filter(records, req)
    return render_template("records.j2", records=records, **params())

@queries.route("/flows")
def flows():
    flows = Flow.query.join(Agent).join(Transaction, Flow.trans_id == Transaction.id)
    req = request.args.to_dict()
    flows = flow_filter(flows, req)

    s = 0
    sums = []
    for f in flows:
        s += -f.amount if f.is_debt else f.amount
        sums.append(round(s, max([c.decimals for c in Currency.query.all()])))
    return render_template("flows.j2", flows=flows, sums=sums, **params())