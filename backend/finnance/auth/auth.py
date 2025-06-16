import re
from http import HTTPStatus

from finnance.errors import APIError, validate
from finnance.models import User
from flask import Blueprint, jsonify
from flask_login import current_user, login_required, login_user, logout_user

from finnance import bcrypt, db

auth = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth.route("/exists", methods=["POST"])
@validate({
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


@auth.route("/existsMail", methods=["POST"])
@validate({
    "type": "object",
    "properties": {
        "email": {"type": "string"}
    },
    "required": ["email"]
})
def exists_mail(email: str):
    # raise APIError(HTTPStatus.BAD_REQUEST, 'something weird')
    user = User.query.filter_by(email=email).first()
    exists = user is not None
    return jsonify({
        "exists": exists
    })


@auth.route("/login", methods=["POST"])
@validate({
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
        success = login_user(user, remember=True)

    return jsonify({
        "auth": success,
    })


@auth.route("/register", methods=["POST"])
@validate({
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
        raise APIError(HTTPStatus.BAD_REQUEST,
                       "Password must contain at least 6 characters")

    # add user
    pwhash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(email=email, username=username, password=pwhash)
    db.session.add(user)
    db.session.commit()

    return '', HTTPStatus.CREATED


@auth.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return '', HTTPStatus.OK


@auth.route("")
def session():
    return jsonify({
        "auth": current_user.get_id() is not None
    })


@auth.route("/me")
@login_required
def me():
    return current_user.api()
