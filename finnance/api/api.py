import json
import time
from http import HTTPStatus

import sqlalchemy
from flask import Blueprint, abort, jsonify, redirect, request, url_for
from flask_login import current_user, login_required, login_user, logout_user

from finnance import bcrypt, login_manager
from finnance.models import (Account, AccountTransfer, Agent, Category,
                             Currency, Flow, Record, Transaction, User)

api = Blueprint('api', __name__, url_prefix='/api',
    static_folder='static', static_url_path='/static/api')

@api.route("/users")
def all_usernames():
    users = User.query.all()
    usernames = [user.username for user in users]
    return jsonify({
        "usernames":
        usernames})

@api.route("/exists", methods=["POST"])
def exists_user():
    try:
        data = json.loads(request.data.decode())
        username = data["username"]
    except json.decoder.JSONDecodeError:
        return "non-json request", 400
    except KeyError:
        return "no username field", 400
    user = User.query.filter_by(username=username).first()
    exists = user is not None
    return jsonify({
        "exists": exists
    })

@api.route("/login", methods=["POST"])
def login():
    try:
        data = json.loads(request.data.decode())
        username = data["username"]
        password = data["password"]
    except json.decoder.JSONDecodeError:
        return "non-json request", 400
    except KeyError:
        return "missing json field(s)", 400
    user = User.query.filter_by(username=username).first()
    if not user:
        return "non-existing username", 400

    success = bcrypt.check_password_hash(user.password, password)
    if success:
        login_user(user)
    
    return jsonify({
        "success": success,
        "token": user.get_id()
    })

@api.route("/logout", methods=["POST"])
@login_required
def logout():
    return jsonify({
        "success": logout_user()
    })

@api.route("/saldos")
@login_required
def saldos():
    agents = Agent.query.filter_by(user_id=current_user.id).join(Transaction, isouter=True).join(
        Flow, sqlalchemy.and_(Agent.id == Flow.agent_id, 
        Transaction.id == Flow.trans_id), isouter=True).group_by(
            Agent.id).order_by(Agent.uses.desc(), Agent.desc).all()
    
    return jsonify({
        "accounts": [
            {
                "id": account.id,
                "desc": account.desc,
                "saldo": account.saldo()
            }
            for account in Account.query.filter_by(user_id=current_user.id)
        ]
    })
    return jsonify(dict(
        accounts=Account.query.filter_by(user_id=current_user.id).all(),
        agents=agents,
        categories=Category.query.filter_by(user_id=current_user.id).order_by(Category.desc).all(),
        currencies=Currency.query.all()
    ))

@login_manager.unauthorized_handler
def unauthorized():
    if request.blueprint == 'api':
        unauth = HTTPStatus.UNAUTHORIZED
        return jsonify({
            "name": unauth._name_,
            "phrase": unauth.phrase,
            "description": unauth.description
        }), unauth._value_
    return redirect(url_for('main.login'))