
from http import HTTPStatus

from finnance.errors import APIError, validate
from finnance.models import Currency, JSONModel
from flask import Blueprint, jsonify
from flask_login import current_user, login_required

from finnance import db

currencies = Blueprint('currencies', __name__, url_prefix='/api/currencies')

@currencies.route("")
@login_required
def all_currencies():
    currencies = Currency.query.filter_by(user_id=current_user.id)
    return JSONModel.obj_to_api([cur.json(deep=False) for cur in currencies])

@currencies.route("/<int:currency_id>")
@login_required
def currency(currency_id):
    currency = Currency.query.filter_by(user_id=current_user.id, id=currency_id).first()
    if currency is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    return currency.api()

@currencies.route("/add", methods=["POST"])
@login_required
@validate({
    "type": "object",
    "properties": {
        "code": {"type": "string"},
        "decimals": {"type": "integer"},
    },
    "required": ["code", "decimals"]
})
def add_currency(code, decimals):
    if Currency.query.filter_by(code=code, user_id=current_user.id).first() is not None:
        raise APIError(HTTPStatus.BAD_REQUEST, "currency code already in use")
    if int(decimals) != decimals or decimals < 0:
        raise APIError(HTTPStatus.BAD_REQUEST, "decimals must be integer >= 0")
    curr = Currency(code=code, decimals=decimals, user_id=current_user.id)
    db.session.add(curr)
    db.session.commit()
    return '', HTTPStatus.CREATED

@currencies.route("/<int:currency_id>/dependencies")
@login_required
def currency_dependencies(currency_id: int):
    curr = Currency.query.filter_by(user_id=current_user.id, id=currency_id).first()
    if curr is None:
        raise APIError(HTTPStatus.NOT_FOUND)

    return jsonify(dict(accounts=len(curr.accounts), transactions=len(curr.transactions)))

@currencies.route("/<int:currency_id>/delete", methods=["DELETE"])
@login_required
def delete_currency(currency_id: int):
    curr = Currency.query.filter_by(user_id=current_user.id, id=currency_id).first()
    if curr is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    
    for trans in curr.transactions:
        for flow in trans.flows:
            db.session.delete(flow)
        for rec in trans.records:
            db.session.delete(rec)
        db.session.delete(trans)
    
    for acc in curr.accounts:
        db.session.delete(acc)
    
    db.session.delete(curr)
    db.session.commit()

    return jsonify({}), HTTPStatus.OK
