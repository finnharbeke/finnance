from flask import render_template, Blueprint, request, redirect, url_for, abort
import sqlalchemy
from finnance import db, bcrypt, app
from finnance.models import Agent, Currency, Category, Transaction, Flow, Account, User
import datetime as dt
from flask_login import login_user, current_user, logout_user, login_required
import re

main = Blueprint('main', __name__, static_url_path='/static/main',
    static_folder='static', template_folder='templates')

def params():
    agents = Agent.query.filter_by(user_id=current_user.id).join(Transaction, isouter=True).join(
        Flow, sqlalchemy.and_(Agent.id == Flow.agent_id, 
        Transaction.id == Flow.trans_id), isouter=True).group_by(
            Agent.id).order_by(Agent.uses.desc(), Agent.desc).all()
    return dict(
        accounts=Account.query.filter_by(user_id=current_user.id).all(),
        agents=agents,
        categories=Category.query.filter_by(user_id=current_user.id).order_by(Category.desc).all(),
        currencies=Currency.query.all()
    )


@main.route("/", methods=["GET"])
@main.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    if request.method == "POST":
        user_tag = request.form.get("user")
        password = request.form.get("password")
        user = User.query.filter_by(username=user_tag).first()
        if not user:
            user = User.query.filter_by(email=user_tag).first()

        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('main.home'))
        else:
            return render_template("login.j2", loggingin=True, loginerr="Invalid user or wrong password")

    return render_template("login.j2")

@main.route("/register", methods=["POST"])
def register():
    email = request.form.get("email")
    username = request.form.get("username")
    password = request.form.get("password")
    passwordRepeat = request.form.get("passwordRepeat")
    email_reg = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
    if not re.match(email_reg, email):
        return render_template("login.j2", registering=True, regerr="invalid E-Mail")
    emuser = User.query.filter_by(email=email).first()
    namuser = User.query.filter_by(username=username).first()
    if emuser or namuser:
        regerr = "E-Mail" if emuser else "Username"
        if emuser and namuser:
            regerr += " and Username are"
        else:
            regerr += " is"
        regerr += " already taken"
        return render_template("login.j2", registering=True, regerr=regerr)
    allowed = r'^[_\da-zA-Z]{4,}$'
    if not re.match(allowed, username):
        if len(username) < 4:
            regerr = "Username must be at least 4 characters long"
        else:
            regerr = "Only use letters, digits and underscores for the username"
        return render_template("login.j2", registering=True, regerr=regerr)
    if len(password) < 6:
        return render_template("login.j2", registering=True, regerr="Password must contain at least 6 characters")
    if password != passwordRepeat:
        return render_template("login.j2", registering=True, regerr="Passwords don't match")
    # add user
    pwhash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(email=email, username=username, password=pwhash)
    db.session.add(user)
    db.session.commit()
    return render_template("login.j2", loggingin=True,
        logininfo=f'Successfully registered user {user.username}, please log in')

@main.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('main.login'))

@main.route("/dashboard", methods=["GET"])
@login_required
def home():
    return render_template("home.j2", **params())

@main.route("/accounts/<int:account_id>", methods=["GET", "POST"])
@login_required
def account(account_id):
    account = Account.query.get(account_id)
    if not account:
        return abort(404)
    if account.user_id != current_user.id:
        return abort(403)
    changes, saldos = account.changes(num=5)
    return render_template("account.j2", account=account,
        last_5=changes, saldos=saldos, **params())

@main.route("/agents/<int:agent_id>")
@login_required
def agent(agent_id):
    agent = Agent.query.get(agent_id)
    if not agent or agent.user_id != current_user.id:
        return abort(404)
    return render_template("agent.j2", agent=agent, **params())

# CODE BELOW IS FOR FORCE RELOADING CSS
@main.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    if endpoint.endswith('static') and app.debug:
        values['q'] = int(dt.datetime.now().timestamp())
    return url_for(endpoint, **values)