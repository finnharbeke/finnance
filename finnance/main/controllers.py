from finnance.account import Account
from flask import render_template, Blueprint, request, redirect, url_for, jsonify, abort
import sqlalchemy
from finnance import db
from finnance.models import Agent, Currency, Category, Transaction, Flow
import datetime as dt, os

main = Blueprint('main', __name__, static_url_path='/static/main',
    static_folder='static', template_folder='templates')

def params():
    agents = Agent.query.join(Transaction, isouter=True).join(
        Flow, sqlalchemy.and_(Agent.id == Flow.agent_id, 
        Transaction.id == Flow.trans_id), isouter=True).group_by(
            Agent.id).order_by(Agent.uses.desc(), Agent.desc).all()
    return dict(
        accounts=Account.query.all(),
        agents=agents,
        categories=Category.query.order_by(Category.desc).all(),
        currencies=Currency.query.all()
    )

@main.route("/", methods=["GET"])
def index():
    return render_template("home.j2", **params())

@main.route("/accounts/<int:account_id>", methods=["GET", "POST"])
def account(account_id):
    account = Account.query.get(account_id)
    if not account:
        return abort(404)
    changes, saldos = account.changes(num=5)
    return render_template("account.j2", account=account,
        last_5=changes, saldos=saldos, **params())

@main.route("/add/account", methods=["GET", "POST"])
def add_account():
    if request.method == "GET":
        return render_template("add_acc.j2", **params())
    else:
        desc = request.form.get("description")
        starting_saldo = float(request.form.get("starting_saldo"))
        date_created = dt.datetime.strptime(
            request.form.get("date_created"), "%d.%m.%Y"
        )
        if date_created > dt.datetime.now():
            return abort(409)
        currency_id = int(request.form.get("currency"))
        account = Account(desc=desc, starting_saldo=starting_saldo, date_created=date_created, currency_id=currency_id)
        db.session.add(account) # pylint: disable=no-member
        try:
            db.session.commit() # pylint: disable=no-member
        except sqlalchemy.exc.IntegrityError:
            abort(409)
        return redirect(url_for('main.add_account'))

@main.route("/accounts/<int:account_id>/transactions")
def account_transactions(account_id):
    account = Account.query.get(account_id)
    if not account:
        return abort(404)
    changes, saldos = account.changes()
    return render_template("transactions.j2", account=account,
        saldos=saldos, changes=changes, **params())

@main.route("/agents/<int:agent_id>")
def agent(agent_id):
    agent = Agent.query.get(agent_id)
    if not agent:
        return abort(404)
    return render_template("agent.j2", agent=agent, **params())

# CODE BELOW IS FOR FORCE RELOADING CSS
@main.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    if endpoint.endswith('static'):
        values['q'] = int(dt.datetime.now().timestamp())
    return url_for(endpoint, **values)