
from http import HTTPStatus

from flask import Blueprint, jsonify
from flask_login import login_required

from finnance import db
from finnance.errors import APIError, validate
from finnance.models import Currency, JSONModel

currencies = Blueprint('currencies', __name__, url_prefix='/api/currencies')

@currencies.route("")
@login_required
def all_currencies():
    currencies = Currency.query.all()
    return JSONModel.obj_to_api([cur.json(deep=False) for cur in currencies])

@currencies.route("/add", methods=["POST"])
@login_required
@validate({
    "type": "object",
    "properties": {
        "code": {"type": "string"},
        "decimals": {"type": "number"},
    },
    "required": ["code", "decimals"]
})
def add_currency(code, decimals):
    if Currency.query.filter_by(code=code).first() is not None:
        raise APIError(HTTPStatus.BAD_REQUEST, "currency code already in use")
    if int(decimals) != decimals or decimals < 0:
        raise APIError(HTTPStatus.BAD_REQUEST, "decimals must be integer >= 0")
    curr = Currency(code=code, decimals=decimals)
    db.session.add(curr)
    db.session.commit()
    return jsonify({
        "success": True
    })