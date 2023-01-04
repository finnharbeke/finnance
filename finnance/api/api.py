import json
from http import HTTPStatus
import traceback

import sqlalchemy
from flask import Blueprint, abort, current_app, jsonify, redirect, request, url_for
from flask_login import current_user, login_required, login_user, logout_user
from jsonschema import Draft202012Validator, ValidationError, validate

from finnance import bcrypt, login_manager, db
from finnance.models import (Account, AccountTransfer, Agent, Category,
                             Currency, Flow, Record, Transaction, User)

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

        def __call__(self):
            try:
                data = json.loads(request.data.decode())
                self.validator.validate(instance=data)
            except json.decoder.JSONDecodeError:
                raise APIError(HTTPStatus.BAD_REQUEST, "Non-JSON format")
            except ValidationError as err:
                raise APIError(HTTPStatus.BAD_REQUEST,
                               f"Invalid JSON schema: {err.message}")
            return self.foo(**data)

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

@api.route("/accounts/<int:account_id>")
@login_required
def account(account_id):
    # raise APIError(HTTPStatus.UNAUTHORIZED)
    acc = Account.query.filter_by(
        user_id=current_user.id, id=account_id).first()
    if acc is None:
        raise APIError(HTTPStatus.UNAUTHORIZED)
    return jsonify(acc.json(deep=True))


@api.route("/me")
@login_required
def me():
    return jsonify(current_user.json(deep=True))

@api.route("/categories/<int:category_id>")
@login_required
def category(category_id):
    # raise APIError(HTTPStatus.UNAUTHORIZED)
    cat = Category.query.filter_by(
        user_id=current_user.id, id=category_id).first()
    if cat is None:
        raise APIError(HTTPStatus.UNAUTHORIZED)
    return jsonify(cat.json(deep=True))

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


@login_manager.unauthorized_handler
def unauthorized():
    if request.blueprint == 'api':
        raise APIError(HTTPStatus.UNAUTHORIZED)
    return redirect(url_for('main.login'))
