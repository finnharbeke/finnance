from flask import Flask, render_template, Blueprint, request, redirect, url_for, jsonify, send_file
import sqlalchemy
from app import db
from app.main.models import Transaction, Account, Agent, Currency, Category
import datetime, io
import matplotlib.pyplot as plt
import seaborn as sns


mod_main = Blueprint('main', __name__)

def trans_from_request(request, account):
    # pylint: disable=no-member
    amount = float(request.form.get("amount"))

    date_issued = datetime.datetime.strptime(request.form.get("date_issued"), "%d.%m.%Y %H:%M")
    if date_issued < account.date_created:
        return False, render_template("error.jinja", title="Creation Failed!", desc="Transaction can't have been executed before the creation of the account!", link=url_for('main.add_transaction'), link_text="Try again")
    if date_issued > datetime.datetime.now():
        return False, render_template("error.jinja", title="Creation Failed!", desc="Transaction can't have been executed after today!", link=url_for('main.add_transaction'), link_text="Try again")
    
    agent_desc = request.form.get("agent")
    agent = Agent.query.filter_by(desc=agent_desc).first()
    if not agent:
        agent = Agent(desc=agent_desc) 
        db.session.add(agent)
        db.session.commit()

    category_id = request.form.get("category")
    comment = request.form.get("comment")

    return True, dict(account_id=account.id, amount=amount, agent_id=agent.id, date_issued=date_issued, category_id=category_id, comment=comment)

@mod_main.route("/accounts/<int:account_id>/transactions/add/", methods=["POST"])
def add_trans(account_id):
    # pylint: disable=no-member
    account = Account.query.get(account_id)
    success, kwargs = trans_from_request(request, account)
    if not success:
        return kwargs
    db.session.add(Transaction(**kwargs))
    db.session.commit()
    return redirect(request.form.get("redirect"))

@mod_main.route("/transactions/edit/<int:transaction_id>", methods=["POST"])
def edit_trans(transaction_id):
    # pylint: disable=no-member
    tr = Transaction.query.get(transaction_id)
    success, columns = trans_from_request(request, tr.account)
    if not success:
        return columns

    for key, val in columns.items():
        setattr(tr, key, val)
    db.session.commit()
    return redirect(request.form.get("redirect"))

@mod_main.route("/", methods=["GET"])
def index():
    accounts = Account.query.all()
    agents = Agent.query.order_by(Agent.desc).all()
    categories = Category.query.order_by(Category.desc).all()
    return render_template("main/home.j2", accounts=accounts, agents=agents, categories=categories)

@mod_main.route("/accounts/<int:account_id>", methods=["GET", "POST"])
def account(account_id):
    account = Account.query.get(account_id)
    agents = Agent.query.order_by(Agent.desc).all()
    categories = Category.query.order_by(Category.desc).all()
    # last 5 transactions
    transactions = Transaction.query.filter_by(account_id=account.id).order_by(Transaction.date_issued.desc()).limit(5).all()
    saldo = account.saldo()
    zipped_transactions = []
    for t in transactions:
        zipped_transactions.append((t, saldo))
        saldo += t.amount

    return render_template("main/account.j2", agents=agents, account=account, categories=categories, last_5=zipped_transactions, formatted=lambda x: f"{round(x, 2):,.2f}")

@mod_main.route("/add/account", methods=["GET", "POST"])
def add_account():
    currencies = Currency.query.all()
    if request.method == "GET":
        return render_template("main/add_acc.j2", currencies=currencies)
    else:
        desc = request.form.get("description")
        starting_saldo = float(request.form.get("starting_saldo"))
        date_created = datetime.datetime.strptime(request.form.get("date_created"), "%d.%m.%Y")
        if date_created > datetime.datetime.now():
            return render_template("error.jinja", title="Creation Failed!", desc="Account can't have been created after today!", link=url_for('main.add_account'), link_text="Try again")
        currency_id = int(request.form.get("currency"))
        account = Account(desc=desc, starting_saldo=starting_saldo, date_created=date_created, currency_id=currency_id)
        db.session.add(account) # pylint: disable=no-member
        try:
            db.session.commit() # pylint: disable=no-member
        except sqlalchemy.exc.IntegrityError:
            return render_template("error.jinja", title="Creation Failed!", desc="Account with same Description already exists!", link=url_for('main.add_account'), link_text="Try again")
        return redirect(url_for('main.add_account'))

@mod_main.route("/accounts/<int:account_id>/transactions")
def account_transactions(account_id):
    account = Account.query.get(account_id)
    transactions = Transaction.query.filter_by(account_id=account.id).order_by(Transaction.date_issued.desc()).all()
    agents = Agent.query.order_by(Agent.desc).all()
    categories = Category.query.order_by(Category.desc).all()
    saldo = account.saldo()
    zipped_transactions = []
    for t in transactions:
        zipped_transactions.append((t, saldo))
        saldo += t.amount
    
    return render_template("main/transactions.j2", account=account, transactions=zipped_transactions, agents=agents, categories=categories, formatted=lambda x: f"{round(x, 2):,.2f}")

@mod_main.route("/accounts/<int:account_id>/plot")
def account_plot(account_id):
    account = Account.query.get(account_id)
    transactions = Transaction.query.filter_by(account_id=account.id).order_by(Transaction.date_issued).all()

    saldo = account.starting_saldo
    saldos = [saldo]
    for t in transactions:
        saldo -= t.amount
        saldos.append(saldo)
    # current saldo
    saldos.append(saldos[-1])

    # Set seaborn & matplotlib
    sns.set("notebook", font_scale=2)
    f, ax = plt.subplots(figsize=(24, 6)) # pylint: disable=unused-variable
    plt.tight_layout()
    # creation, transactions and now
    x = [account.date_created] + [t.date_issued for t in transactions] + [datetime.datetime.now()]

    plt.plot(x, saldos, drawstyle='steps-post', linewidth=2.5)
    ax.set_xlim(left=x[0], right=[x[-1]])

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

# CODE BELOW IS FOR FORCE RELOADING CSS
@mod_main.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    import os
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(mod_main.root_path, '..',
                                 endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)