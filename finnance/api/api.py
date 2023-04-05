import json
from http import HTTPStatus
import re
import traceback

import datetime as dt
import sqlalchemy
from flask import Blueprint, abort, current_app, jsonify, redirect, request, url_for
from flask_login import current_user, login_required, login_user, logout_user
from jsonschema import Draft202012Validator, ValidationError, validate

from finnance import bcrypt, login_manager, db
from finnance.models import (Account, AccountTransfer, Agent, Category,
                             Currency, Flow, JSONModel, Record, Transaction, User)

api = Blueprint('api', __name__, url_prefix='/api',
                static_folder='static', static_url_path='/static/api')


class APIError(Exception):
    def __init__(self, status: HTTPStatus, msg=None):
        self.status = status
        self.msg = status.description if msg is None else msg


def check_input(schema):
    class Wrapper:
        def __init__(self, foo, schema):
            self.foo = foo
            self.__name__ = foo.__name__
            self.schema = schema
            self.validator = Draft202012Validator(schema=schema)

        def __call__(self, **kwargs):
            try:
                data = json.loads(request.data.decode())
                self.validator.validate(instance=data)
            except json.decoder.JSONDecodeError:
                raise APIError(HTTPStatus.BAD_REQUEST, "Non-JSON format")
            except ValidationError as err:
                raise APIError(HTTPStatus.BAD_REQUEST,
                               f"Invalid JSON schema: {err.message}")
            return self.foo(**data, **kwargs)

    return lambda foo: Wrapper(foo, schema)


@api.route("/exists", methods=["POST"])
@check_input({
    "type": "object",
    "properties": {
        "username": {"type": "string"}
    },
    "required": ["username"]
})
def exists_user(username: str):
    user = User.query.filter_by(username=username).first()
    exists = user is not None
    return jsonify({
        "exists": exists
    })

@api.route("/existsMail", methods=["POST"])
@check_input({
    "type": "object",
    "properties": {
        "email": {"type": "string"}
    },
    "required": ["email"]
})
def exists_mail(email: str):
    user = User.query.filter_by(email=email).first()
    exists = user is not None
    return jsonify({
        "exists": exists
    })


@api.route("/login", methods=["POST"])
@check_input({
    "type": "object",
    "properties": {
        "username": {"type": "string"},
        "password": {"type": "string"}
    },
    "required": ["username", "password"]
})
def login(username: str, password: str):
    user = User.query.filter_by(username=username).first()
    if not user:
        raise APIError(HTTPStatus.BAD_REQUEST, "Username doesn't exist")

    success = bcrypt.check_password_hash(user.password, password)
    if success:
        login_user(user)

    return jsonify({
        "auth": success,
    })

@api.route("/register", methods=["POST"])
@check_input({
    "type": "object",
    "properties": {
        "username": {"type": "string"},
        "email": {"type": "string"},
        "password": {"type": "string"}
    },
    "required": ["username", "email", "password"]
})
def register(username: str, email: str, password: str):
    emuser = User.query.filter_by(email=email).first()
    namuser = User.query.filter_by(username=username).first()
    if emuser or namuser:
        regerr = "E-Mail" if emuser else "Username"
        if emuser and namuser:
            regerr += " and Username are"
        else:
            regerr += " is"
        regerr += " already taken"
        raise APIError(HTTPStatus.BAD_REQUEST, regerr)
    allowed = r'^[_\da-zA-Z]{3,}$'
    if not re.match(allowed, username):
        if len(username) < 3:
            regerr = "Username must be at least 3 characters long"
        else:
            regerr = "Only use letters, digits and underscores for the username"
        raise APIError(HTTPStatus.BAD_REQUEST, regerr)
    email_reg = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
    if not re.match(email_reg, email):
        raise APIError(HTTPStatus.BAD_REQUEST, "invalid E-Mail")
    if len(password) < 6:
        raise APIError(HTTPStatus.BAD_REQUEST, "Password must contain at least 6 characters")

    # add user
    pwhash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(email=email, username=username, password=pwhash)
    db.session.add(user)
    db.session.commit()

    return jsonify({
        "success": User.query.filter_by(username=username).first() is not None,
    })


@api.route("/logout", methods=["POST"])
@login_required
def logout():
    return jsonify({
        "success": logout_user()
    })


@api.route("/session")
def session():
    if current_user.get_id() is None:
        return jsonify({
            "auth": False
        })
    else:
        return jsonify({
            "auth": True
        })

@api.route("/accounts")
@login_required
def accounts():
    accs = Account.query.filter_by(
        user_id=current_user.id).order_by(Account.order.asc()).all()
    return JSONModel.obj_to_api([acc.json(deep=True) for acc in accs])

@api.route("/accounts/<int:account_id>")
@login_required
def account(account_id):
    acc = Account.query.filter_by(
        user_id=current_user.id, id=account_id).first()
    if acc is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    return acc.api()

@api.route("accounts/<int:account_id>/changes")
@login_required
def changes(account_id):
    acc: Account = Account.query.filter_by(
        user_id=current_user.id, id=account_id).first()
    if acc is None:
        raise APIError(HTTPStatus.UNAUTHORIZED)
    
    kwargs = {"start": None, "end": None, "n": None}
    
    for key, val in request.args.to_dict().items():
        if key in kwargs and val != '':
            try:
                if key == 'n':
                    kwargs[key] = int(val)
                else:
                    kwargs[key] = dt.datetime.fromisoformat(val)
            except ValueError:
                raise APIError(HTTPStatus.BAD_REQUEST)

    return acc.jsonify_changes(**kwargs)


@api.route("/me")
@login_required
def me():
    return current_user.api()

@api.route("/categories/<int:category_id>")
@login_required
def category(category_id):
    # raise APIError(HTTPStatus.UNAUTHORIZED)
    cat = Category.query.filter_by(
        user_id=current_user.id, id=category_id).first()
    if cat is None:
        raise APIError(HTTPStatus.UNAUTHORIZED)
    return cat.api()

@api.route("/agents")
@login_required
def agents():
    # raise APIError(HTTPStatus.UNAUTHORIZED)
    agents = Agent.query.filter_by(user_id=current_user.id).join(Transaction, isouter=True).join(
        Flow, sqlalchemy.and_(Agent.id == Flow.agent_id, 
        Transaction.id == Flow.trans_id), isouter=True).group_by(
            Agent.id).order_by(Agent.uses.desc(), Agent.desc).all()
    return JSONModel.obj_to_api([agent.json(deep=True) for agent in agents])

@api.route("/categories")
@login_required
def categories():
    categories = Category.query.filter_by(user_id=current_user.id).all()
    return JSONModel.obj_to_api([cat.json(deep=True) for cat in categories])

@api.route("/currencies")
@login_required
def currencies():
    currencies = Currency.query.all()
    return JSONModel.obj_to_api([cur.json(deep=False) for cur in currencies])

@api.route("/currencies/add", methods=["POST"])
@login_required
@check_input({
    "type": "object",
    "properties": {
        "code": {"type": "string"},
        "decimals": {"type": "number"},
    },
    "required": ["code", "decimals"]
})
def add_currency(code, decimals):
    if Currency.query.filter_by(code=code).first() is not None:
        raise APIError(HTTPStatus.BAD_REQUEST, "code already in use")
    if int(decimals) != decimals or decimals < 0:
        raise APIError(HTTPStatus.BAD_REQUEST, "decimals must be integer >= 0")
    curr = Currency(code=code, decimals=decimals)
    db.session.add(curr)
    db.session.commit()
    return jsonify({
        "success": True
    })

@api.errorhandler(APIError)
def handle_apierror(err: APIError):
    return jsonify({
        "msg": err.msg
    }), err.status.value


@api.errorhandler(Exception)
def handle_exception(err: Exception):
    """Return JSON instead of HTML for any other server error"""
    app = current_app
    app.logger.error(f"Unknown Exception: {str(err)}")
    app.logger.debug(''.join(traceback.format_exception(
        etype=type(err), value=err, tb=err.__traceback__)))
    return jsonify({
        "msg": f"{type(err).__name__}: {str(err)}"
    }), 500

@api.route("/transactions/add", methods=["POST"])
@login_required
@check_input({
    "type": "object",
    "properties": {
        "account_id": {"type": "number"},
        "amount": {"type": "number"},
        "date_issued": {"type": "string"},
        "is_expense": {"type": "boolean"},
        "agent": {"type": "string"},
        "comment": {"type": "string"},
        "flows": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "amount": {"type": "number"},
                    "agent": {"type": "string"},
                }
            }
        },
        "records": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "amount": {"type": "number"},
                    "category_id": {"type": "number"},
                }
            }
        },
    },
    "required": ["amount", "date_issued", "is_expense", "agent", "comment", "flows", "records"]
})
def add_trans(edit=None, **data):
    data['date_issued'] = dt.datetime.fromisoformat(data.pop('date_issued'))

    if data['account_id']:
        account = Account.query.get(data['account_id'])
        if account.user_id != current_user.id:
            raise APIError(HTTPStatus.UNAUTHORIZED)
        # check saldo
        saldo = account.saldo
        # TODO: saldo at date_issued
        if edit is None:
            diff = -data['amount'] if data['is_expense'] else data['amount']
        else:
            tr = Transaction.query.get(edit)
            diff = tr.amount if tr.is_expense else -tr.amount
            diff += -data['amount'] if data['is_expense'] else data['amount']

        if saldo + diff < 0:
            raise APIError(HTTPStatus.BAD_REQUEST,
                               "Transaction results in negative Account Saldo!")

        data['currency_id'] = account.currency_id

    def agent_createif(agent_desc):
        if agent_desc is None:
            return None
        agent = Agent.query.filter_by(desc=agent_desc).first()
        if not agent:
            agent = Agent(desc=agent_desc, user_id=current_user.id)
            db.session.add(agent)
            db.session.commit()
        return agent
    
    # AGENTs
    agent = agent_createif(data.pop('agent'))
    data['agent_id'] = agent.id
    # remote_agent = agent_createif(data.pop('remote_agent'))
    
    flows = data.pop('flows')

    for flow in flows:
        flow['agent_id'] = agent_createif(flow.pop('agent')).id
        flow['is_debt'] = not data['is_expense']
    
    records = data.pop('records')

    trans = Transaction(**data, user_id=current_user.id)
    db.session.add(trans)
    db.session.commit()
    for record in records:
        db.session.add(
            Record(**record, trans_id=trans.id)
        )
    for flow in flows:
        db.session.add(
            Flow(**flow, trans_id=trans.id)
        )
    db.session.commit()
        
    return jsonify({
        "success": True
    })

@api.route("/accounts/edit/<int:account_id>", methods=["PUT"])
@login_required
@check_input({
    "type": "object",
    "properties": {
        "desc": {"type": "string"},
        "color": {"type": "string"},
        "date_created": {"type": "string"},
        "starting_saldo": {"type": "number"},
        "currency_id": {"type": "number"},
    }
})
def edit_account(account_id: int, **data):
    account: Account = Account.query.filter_by(user_id=current_user.id, id=account_id).first()
    if account is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    
    changed = False
    if 'desc' in data:
        changed = account.desc != data['desc']
        account.desc = data['desc']
    
    if 'color' in data:
        if not re.match('^#[a-fA-F0-9]{6}$', data['color']):
            raise APIError(HTTPStatus.BAD_REQUEST, "color: invalid color hex-string")
        changed = changed or account.color != data['color']
        account.color = data['color']

    if 'date_created' in data:
        try:
            new_date = dt.datetime.fromisoformat(data['date_created'])
            for ch in account.changes()[0]:
                if ch.date_issued < new_date:
                    raise APIError(HTTPStatus.BAD_REQUEST, "date_created: there exist account changes before this date")
            changed = changed or account.date_created != new_date
            account.date_created = new_date
        except ValueError:
            raise APIError(HTTPStatus.BAD_REQUEST, "date_created: invalid isoformat string")
    
    if 'starting_saldo' in data:
        changed = changed or account.starting_saldo != data['starting_saldo']
        if data['starting_saldo'] < 0:
            raise APIError(HTTPStatus.BAD_REQUEST, "negative starting_saldo")
        account.starting_saldo = data['starting_saldo']

    if 'currency_id' in data:
        changed = changed or account.currency_id != data['currency_id']
        if Currency.query.get(data['currency_id']) is None:
            raise APIError(HTTPStatus.BAD_REQUEST, "invalid currency_id")
        account.currency_id = data['currency_id']
        for trans in account.transactions:
            trans.currency_id = data['currency_id']

    if not changed:
        raise APIError(HTTPStatus.BAD_REQUEST, "edit request has no changes")
        
    db.session.commit()
    return jsonify({
        "success": True
    })

@api.route("/accounts/edit/orders", methods=["PUT"])
@login_required
@check_input({
    "type": "object",
    "properties": {
        "orders": {
            "type": "array",
            "items": {"type": "number"}
        },
        "ids": {
            "type": "array",
            "items": {"type": "number"}
        },
        "required": ["orders", "ids"]
    }
})
def edit_account_orders(orders: list[int], ids: list[int]):
    if len(orders) != len(ids):
        raise APIError(HTTPStatus.BAD_REQUEST, "orders and ids must have same length")

    n_changed = 0


    for acc_id, order in zip(orders, ids):
        account: Account = Account.query.filter_by(user_id=current_user.id, id=acc_id).first()
        if account is None:
            raise APIError(HTTPStatus.BAD_REQUEST, "non-existent account id")
        if order < 0:
            raise APIError(HTTPStatus.BAD_REQUEST, "order must be non-negative")
        if account.order == order:
            continue
        n_changed += 1
        account.order = -n_changed

    if n_changed == 0:
        raise APIError(HTTPStatus.BAD_REQUEST, "edit request has no changes")

    for acc_id, order in zip(orders, ids):
        account: Account = Account.query.filter_by(user_id=current_user.id, id=acc_id).first()
        if account.order == order:
            continue
        account.order = order

    db.session.commit()
    return jsonify({
        "success": True
    })

@login_manager.unauthorized_handler
def unauthorized():
    if request.blueprint == 'api':
        raise APIError(HTTPStatus.UNAUTHORIZED)
    return redirect(url_for('main.login'))
