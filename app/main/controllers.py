from flask import Flask, render_template, Blueprint, request, redirect, url_for
from app import db
from app.main.models import Transaction, Account, Agent, Currency
import datetime

mod_main = Blueprint('main', __name__)

@mod_main.route("/")
def index():
    return render_template("main/index.html")

@mod_main.route("/add/transaction", methods=["GET", "POST"])
def add_transaction():
    accounts = Account.query.all()
    # if not accounts:
    #     return render_template("error.html", title="No Account", desc="Create an Account First!", link=url_for('main.add_account'), link_text="Create Account")
    agents = Agent.query.all()
    if request.method == "GET":
        return render_template("main/add_trans.html", accounts=accounts, agents=agents)
    else:
        account = request.form.get("account")
        amount = float(request.form.get("amount"))
        agent = request.form.get("agent")
        date_issued = datetime.datetime(request.form.get("date_issued"))
        comment = request.form.get("comment")

@mod_main.route("/add/account", methods=["GET", "POST"])
def add_account():
    currencies = Currency.query.all()
    if request.method == "GET":
        return render_template("main/add_acc.html", currencies=currencies)
    else:
        desc = request.form.get("description")
        starting_saldo = float(request.form.get("starting_saldo"))
        date_created = datetime.datetime.strftime(request.form.get("date_created"), "%d.%m.%Y")
        currency_id = int(request.form.get("currency_id"))