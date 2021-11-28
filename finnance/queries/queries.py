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

@queries.route("/records")
def records():
    records = Record.query.join(Category).join(Transaction)
    if request.args.get('currency_id'):
        curr = Currency.query.get(request.args.get('currency_id'))
        if curr is None:
            return abort(404)
        records = records.filter(Transaction.currency_id == curr.id)
    if request.args.get('category_id'):
        cat = Category.query.get(request.args.get('category_id'))
        if cat is None:
            return abort(404)
        records = records.filter(Category.id == cat.id)
    if request.args.get('min'):
        try:
            min_ = float(request.args.get('min'))
            records = records.filter(Record.amount >= min_)
        except ValueError:
            return abort(400)
    if request.args.get('max'):
        try:
            max_ = float(request.args.get('max'))
            records = records.filter(Record.amount <= max_)
        except ValueError:
            return abort(400)
    if request.args.get('start'):
        try:
            start = dt.datetime.fromisoformat(request.args.get('start'))
            records = records.filter(Transaction.date_issued >= start)
        except ValueError:
            return abort(400)
    if request.args.get('end'):
        try:
            end = dt.datetime.fromisoformat(request.args.get('end'))
            print(end)
            records = records.filter(Transaction.date_issued <= end)
        except ValueError:
            return abort(400)
    
    return render_template("records.j2", records=records, **params())

@queries.route("/flows")
def flows():
    flows = Flow.query.join(Agent).join(Transaction, Flow.trans_id == Transaction.id)
    if request.args.get('currency_id'):
        curr = Currency.query.get(request.args.get('currency_id'))
        if curr is None:
            return abort(404)
        flows = flows.filter(Transaction.currency_id == curr.id)
    if request.args.get('agent'):
        agent = Agent.query.filter_by(desc=request.args.get('agent')).first()
        if agent is None:
            flows = flows.filter(False)
        else:
            flows = flows.filter(Flow.agent_id == agent.id)
    if request.args.get('min'):
        try:
            min_ = float(request.args.get('min'))
            flows = flows.filter(Flow.amount >= min_)
        except ValueError:
            return abort(400)
    if request.args.get('max'):
        try:
            max_ = float(request.args.get('max'))
            flows = flows.filter(Flow.amount <= max_)
        except ValueError:
            return abort(400)
    if request.args.get('start'):
        try:
            start = dt.datetime.fromisoformat(request.args.get('start'))
            flows = flows.filter(Transaction.date_issued >= start)
        except ValueError:
            return abort(400)
    if request.args.get('end'):
        try:
            end = dt.datetime.fromisoformat(request.args.get('end'))
            print(end)
            flows = flows.filter(Transaction.date_issued <= end)
        except ValueError:
            return abort(400)

    flows = flows.order_by(Transaction.date_issued)

    s = 0
    sums = []
    for f in flows:
        s += -f.amount if f.is_debt else f.amount
        sums.append(round(s, max([c.decimals for c in Currency.query.all()])))
    return render_template("flows.j2", flows=flows, sums=sums, **params())