from flask import Blueprint, render_template, abort, url_for, request
from finnance.main.controllers import dated_url_for, params
from finnance.models import Account, Category, Currency, Record, Transaction
import datetime as dt

tables = Blueprint('tables', __name__, template_folder='templates')

@tables.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

@tables.route("/accounts/<int:account_id>/transactions")
def account_transactions(account_id):
    account = Account.query.get(account_id)
    if account is None:
        return abort(404)
    changes, saldos = account.changes()
    return render_template("transactions.j2", account=account,
        saldos=saldos, changes=changes, **params())

@tables.route("/records")
def records():
    records = Record.query.join(Category).join(Transaction)
    print(request.args.to_dict())
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
