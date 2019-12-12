from flask import Flask, render_template, Blueprint, request, redirect, url_for, jsonify
import sqlalchemy
from app import db
from app.main.models import Transaction, Account, Agent, Currency
import datetime

mod_main = Blueprint('main', __name__)

@mod_main.route("/")
def index():
    accounts = Account.query.all()
    accounts = zip(list(range(1, len(accounts)+1)), accounts)
    return render_template("main/index.html", accounts=accounts)

@mod_main.route("/add/transaction", methods=["GET", "POST"])
def add_transaction():
    accounts = Account.query.all()
    # if not accounts:
    #     return render_template("error.html", title="No Account", desc="Create an Account First!", link=url_for('main.add_account'), link_text="Create Account")
    agents = Agent.query.all()
    if request.method == "GET":
        return render_template("main/add_trans.html", accounts=accounts, agents=agents)
    else:
        account = Account.query.get(int(request.form.get("account")))
        amount = float(request.form.get("amount"))

        date_issued = datetime.datetime.strptime(request.form.get("date_issued"), "%d.%m.%Y %H:%M")
        if date_issued < account.date_created:
            return render_template("error.html", title="Creation Failed!", desc="Transaction can't have been executed before the creation of the account!", link=url_for('main.add_transaction'), link_text="Try again")
        if date_issued > datetime.datetime.now():
            return render_template("error.html", title="Creation Failed!", desc="Transaction can't have been executed after today!", link=url_for('main.add_transaction'), link_text="Try again")
        
        agent_desc = request.form.get("agent")
        agent = Agent.query.filter_by(desc=agent_desc).first()
        if not agent:
            agent = Agent(desc=agent_desc) 
            db.session.add(agent)
            db.session.commit()

        comment = request.form.get("comment")

        transaction = Transaction(account_id=account.id, amount=amount, agent_id=agent.id, date_issued=date_issued, comment=comment)
        db.session.add(transaction)
        db.session.commit()
        return redirect(url_for('main.add_transaction'))

@mod_main.route("/add/account", methods=["GET", "POST"])
def add_account():
    currencies = Currency.query.all()
    if request.method == "GET":
        return render_template("main/add_acc.html", currencies=currencies)
    else:
        desc = request.form.get("description")
        starting_saldo = float(request.form.get("starting_saldo"))
        date_created = datetime.datetime.strptime(request.form.get("date_created"), "%d.%m.%Y")
        if date_created > datetime.datetime.now():
            return render_template("error.html", title="Creation Failed!", desc="Account can't have been created after today!", link=url_for('main.add_account'), link_text="Try again")
        currency_id = int(request.form.get("currency"))
        account = Account(desc=desc, starting_saldo=starting_saldo, date_created=date_created, currency_id=currency_id)
        db.session.add(account)
        try:
            db.session.commit()
        except sqlalchemy.exc.IntegrityError:
            return render_template("error.html", title="Creation Failed!", desc="Account with same Description already exists!", link=url_for('main.add_account'), link_text="Try again")
        return redirect(url_for('main.add_account'))

@mod_main.route("/accounts")
def list_accounts():
    accounts = sorted(Account.query.all(), key=lambda x: (x.date_created, x.desc.lower()))
    accounts = zip(list(range(1, len(accounts)+1)), accounts)
    return render_template("main/accounts.html", accounts=accounts)

@mod_main.route("/accounts/<int:account_id>")
def account(account_id):
    account = Account.query.get(account_id)
    transactions = sorted(account.transactions, key=lambda x: x.date_issued)
    saldo = account.starting_saldo
    zipped_transactions = []
    for i, t in enumerate(transactions):
        saldo -= t.amount
        zipped_transactions.append((i+1, t, Agent.query.get(t.agent_id), f"{round(saldo, 2):9.2f}" if saldo >= 0.005 or saldo <= -0.005 else "0"))
    
    code = Currency.query.get(account.currency_id).code
    return render_template("main/account.html", account=account, transactions=zipped_transactions, currency_code=code)

@mod_main.route("/accounts/<int:account_id>/transactions")
def account_transactions(account_id):
    account = Account.query.get(account_id)
    transactions = sorted(account.transactions, key=lambda x: x.date_issued)
    saldo = account.starting_saldo
    zipped_transactions = []
    for i, t in enumerate(transactions):
        saldo -= t.amount
        zipped_transactions.append((i+1, t, Agent.query.get(t.agent_id), f"{round(saldo, 2):9.2f}" if saldo >= 0.005 or saldo <= -0.005 else "0"))
    
    code = Currency.query.get(account.currency_id).code
    return render_template("main/account_transactions.html", account=account, transactions=zipped_transactions, currency_code=code)

@mod_main.route("/transactions/<int:transaction_id>")
def transaction(transaction_id):
    transaction = Transaction.query.get(transaction_id)
    return jsonify(transaction.to_dict())

@mod_main.route("/api/transactions/<int:transaction_id>")
def api_transaction(transaction_id):
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({"error": "Invalid transaction_id!"}), 422

    return jsonify(transaction.to_dict())

@mod_main.route("/api/accounts/<int:account_id>")
def api_account(account_id):
    account = Account.query.get(account_id)
    if not account:
        return jsonify({"error": "Invalid account_id!"}), 422

    return jsonify(account.to_dict())

@mod_main.route("/api/agents/<int:agent_id>")
def api_agent(agent_id):
    agent = Agent.query.get(agent_id)
    if not agent:
        return jsonify({"error": "Invalid agent_id!"}), 422

    return jsonify(agent.to_dict())