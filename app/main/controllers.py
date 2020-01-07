from flask import Flask, render_template, Blueprint, request, redirect, url_for, jsonify, send_file
import sqlalchemy
from app import db
from app.main.models import Transaction, Account, Agent, Currency
import datetime, io
import matplotlib.pyplot as plt
import seaborn as sns


mod_main = Blueprint('main', __name__)

def add_trans(request, redirect_url, account):
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
    return redirect(redirect_url)

@mod_main.route("/", methods=["GET", "POST"])
def index():
    accounts = Account.query.all()
    agents = Agent.query.all()
    if request.method == "GET":
        return render_template("main/index.html", accounts=accounts, agents=agents)
    else:
        account = Account.query.get(int(request.form.get("account_id")))
        return add_trans(request, url_for('main.index'), account)

@mod_main.route("/accounts/<int:account_id>", methods=["GET", "POST"])
def account(account_id):
    account = Account.query.get(account_id)
    agents = Agent.query.all()
    # last 5 transactions
    transactions = Transaction.query.filter_by(account_id=account.id).order_by(Transaction.date_issued.desc()).limit(5).all()
    saldo = account.saldo()
    zipped_transactions = []
    for t in transactions:
        zipped_transactions.append((t, f"{round(abs(saldo), 2):,.2f}"))
        saldo += t.amount

    if request.method == "GET":
        return render_template("main/account.html", agents=agents, account=account, last_5=zipped_transactions, formatted=lambda x: f"{round(x, 2):,.2f}")
    else:
        return add_trans(request, url_for('main.account', account_id=account.id), account)

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
    accounts = Account.query.order_by(Account.date_created).all()
    accounts = zip(list(range(1, len(accounts)+1)), accounts)
    return render_template("main/accounts.html", accounts=accounts)


@mod_main.route("/accounts/<int:account_id>/transactions")
def account_transactions(account_id):
    account = Account.query.get(account_id)
    transactions = Transaction.query.filter_by(account_id=account.id).order_by(Transaction.date_issued.desc()).all()
    saldo = account.saldo()
    zipped_transactions = []
    for t in transactions:
        zipped_transactions.append((t, f"{round(abs(saldo), 2):,.2f}"))
        saldo += t.amount
    
    return render_template("main/account_transactions.html", account=account, transactions=zipped_transactions, formatted=lambda x: f"{round(x, 2):,.2f}")

@mod_main.route("/accounts/<int:account_id>/plot")
def account_plot(account_id):
    account = Account.query.get(account_id)
    transactions = Transaction.query.filter_by(account_id=account.id).order_by(Transaction.date_issued).all()
    saldo = account.starting_saldo
    saldos = [account.starting_saldo]
    for t in transactions:
        saldo -= t.amount
        saldos.append(saldo)

    sns.set("notebook", font_scale=2)
    f, ax = plt.subplots(figsize=(24, 6))
    plt.tight_layout()
    sns.lineplot(x=[account.date_created]+[t.date_issued for t in transactions], y=saldos)

    bytes_image = io.BytesIO()
    plt.savefig(bytes_image, format='png')
    bytes_image.seek(0)

    plt.close()

    return send_file(bytes_image,
                     attachment_filename='plot.png',
                     mimetype='image/png')

@mod_main.route("/accounts/<int:account_id>/analysis")
def account_analysis(account_id):
    pass

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