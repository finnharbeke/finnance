from app.main.account import Account
from flask import render_template, Blueprint, request, redirect, url_for, jsonify, send_file
import sqlalchemy
from app import db
from app.main.models import Transaction, Agent, Currency, Category, Record
import datetime as dt, io
import matplotlib.pyplot as plt
import seaborn as sns

mod_main = Blueprint('main', __name__)

def params():
    return dict(
        accounts=Account.query.all(),
        agents=Agent.query.order_by(Agent.desc).all(),
        categories=Category.query.order_by(Category.desc).all(),
        currencies=Currency.query.all()
    )

@mod_main.route("/", methods=["GET"])
def index():
    return render_template("main/home.j2", **params())

@mod_main.route("/accounts/<int:account_id>", methods=["GET", "POST"])
def account(account_id):
    account = Account.query.get(account_id)
    saldo, changes = account.changes(num=5)
    return render_template("main/account.j2", account=account,
        last_5=changes, saldo=saldo, **params())

@mod_main.route("/add/account", methods=["GET", "POST"])
def add_account():
    if request.method == "GET":
        return render_template("main/add_acc.j2", **params())
    else:
        desc = request.form.get("description")
        starting_saldo = float(request.form.get("starting_saldo"))
        date_created = dt.datetime.strptime(
            request.form.get("date_created"), "%d.%m.%Y"
        )
        if date_created > dt.datetime.now():
            return render_template("error.j2", 
                title="Creation Failed!",
                desc="Account can't have been created after today!",
                link=url_for('main.add_account'), link_text="Try again"
            )
        currency_id = int(request.form.get("currency"))
        account = Account(desc=desc, starting_saldo=starting_saldo, date_created=date_created, currency_id=currency_id)
        db.session.add(account) # pylint: disable=no-member
        try:
            db.session.commit() # pylint: disable=no-member
        except sqlalchemy.exc.IntegrityError:
            return render_template("error.j2", title="Creation Failed!", 
                desc="Account with same Description already exists!",
                link=url_for('main.add_account'), link_text="Try again"
            )
        return redirect(url_for('main.add_account'))

@mod_main.route("/accounts/<int:account_id>/transactions")
def account_transactions(account_id):
    account = Account.query.get(account_id)
    saldo, changes = account.changes()
    
    return render_template("main/transactions.j2", account=account,
        saldo=saldo, changes=changes, **params())

@mod_main.route("/accounts/<int:account_id>/plot")
def account_plot(account_id):
    account = Account.query.get(account_id)

    saldo, changes = account.changes(saldo_formatted=False)
    changes = changes[::-1]

    # Set seaborn & matplotlib
    sns.set("notebook", font_scale=2)
    f, ax = plt.subplots(figsize=(24, 6))
    plt.tight_layout()
    # creation, transactions and now
    x = [account.date_created]*2 + [change.date_issued for change in changes] + [dt.datetime.now()]
    y = [0, account.starting_saldo] + [change.saldo(formatted=False) for change in changes] + [saldo]

    plt.plot(x, y, drawstyle='steps-post', linewidth=2.5)
    ax.set_xlim(left=x[0], right=[x[-1]])

    bytes_image = io.BytesIO()
    plt.savefig(bytes_image, format='png')
    bytes_image.seek(0)
    plt.close()

    return send_file(bytes_image,
                     attachment_filename='plot.png',
                     mimetype='image/png')

@mod_main.route("/agents/<int:agent_id>")
def agent(agent_id):
    agent = Agent.query.get(agent_id)
    if not agent:
        return jsonify({"error": "Invalid agent_id!"}), 422

    return render_template("main/agent.j2", agent=agent, **params())

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