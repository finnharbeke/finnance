import re
from datetime import datetime
from http import HTTPStatus

from finnance.errors import APIError, validate
from finnance.models import Account, Currency, JSONModel
from finnance.params import parseSearchParams
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

from finnance import db

accounts = Blueprint('accounts', __name__, url_prefix='/api/accounts')

@accounts.route("")
@login_required
def all_accounts():
    accs = Account.query.filter_by(
        user_id=current_user.id).order_by(Account.order.asc()).all()
    return JSONModel.obj_to_api([acc.json(deep=True) for acc in accs])

@accounts.route("/<int:account_id>")
@login_required
def account(account_id):
    acc = Account.query.filter_by(
        user_id=current_user.id, id=account_id).first()
    if acc is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    return acc.api()

@accounts.route("/<int:account_id>/changes")
@login_required
def changes(account_id):
    acc: Account = Account.query.filter_by(
        user_id=current_user.id, id=account_id).first()
    if acc is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    
    kwargs = parseSearchParams(request.args.to_dict(), dict(
        start=datetime, end=datetime, search=str
    ))

    return acc.jsonify_changes(**kwargs)

@accounts.route("/<int:account_id>/edit", methods=["PUT"])
@login_required
@validate({
    "type": "object",
    "properties": {
        "desc": {"type": "string"},
        "color": {"type": "string"},
        "date_created": {"type": "string"},
        "starting_saldo": {"type": "integer"},
        "currency_id": {"type": "integer"},
    }
})
def edit_account(account_id: int, **data):
    account: Account = Account.query.filter_by(user_id=current_user.id, id=account_id).first()
    if account is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    
    if 'desc' in data:
        account.desc = data['desc']
    
    if 'color' in data:
        if not re.match('^#[a-fA-F0-9]{6}$', data['color']):
            raise APIError(HTTPStatus.BAD_REQUEST, "color: invalid color hex-string")
        account.color = data['color']

    if 'date_created' in data:
        try:
            new_date = datetime.fromisoformat(data['date_created'])
            for ch in account.changes()[0]:
                if ch.date_issued < new_date:
                    raise APIError(HTTPStatus.BAD_REQUEST, "date_created: there exist account changes before this date")
            account.date_created = new_date
        except ValueError:
            raise APIError(HTTPStatus.BAD_REQUEST, "date_created: invalid isoformat string")
    
    if 'starting_saldo' in data:
        if data['starting_saldo'] < 0:
            raise APIError(HTTPStatus.BAD_REQUEST, "negative starting_saldo")
        account.starting_saldo = data['starting_saldo']

    if 'currency_id' in data:
        if Currency.query.filter_by(user_id=current_user.id, id=data['currency_id']).first() is None:
            raise APIError(HTTPStatus.BAD_REQUEST, "invalid currency_id")
        account.currency_id = data['currency_id']
        for trans in account.transactions:
            trans.currency_id = data['currency_id']
        
    db.session.commit()
    return '', HTTPStatus.CREATED

@accounts.route("/orders", methods=["PUT"])
@login_required
@validate({
    "type": "object",
    "properties": {
        "orders": {
            "type": "array",
            "items": {"type": "integer"}
        },
        "ids": {
            "type": "array",
            "items": {"type": "integer"}
        },
        "required": ["orders", "ids"]
    }
})
def edit_account_orders(orders: list[int], ids: list[int]):
    if len(orders) != len(ids):
        raise APIError(HTTPStatus.BAD_REQUEST, "orders and ids must have same length")

    n_changed = 0


    for acc_id, order in zip(ids, orders):
        account: Account = Account.query.filter_by(user_id=current_user.id, id=acc_id).first()
        if account is None:
            raise APIError(HTTPStatus.BAD_REQUEST, "non-existent account id")
        if order < 0:
            raise APIError(HTTPStatus.BAD_REQUEST, "order must be non-negative")
        if account.order == order:
            continue
        n_changed += 1
        account.order = -n_changed

    for acc_id, order in zip(ids, orders):
        account: Account = Account.query.filter_by(user_id=current_user.id, id=acc_id).first()
        if account.order == order:
            continue
        account.order = order

    db.session.commit()
    return '', HTTPStatus.CREATED

@accounts.route("/add", methods=["POST"])
@login_required
@validate({
    "type": "object",
    "properties": {
        "desc": {"type": "string"},
        "color": {"type": "string"},
        "date_created": {"type": "string"},
        "starting_saldo": {"type": "integer"},
        "currency_id": {"type": "integer"},
    },
    "required": ["desc", "color", "date_created", "starting_saldo", "currency_id"]
})
def add_acc(desc: str, starting_saldo: int, date_created: str, currency_id: int, color: str):
    date_created = datetime.fromisoformat(date_created)
    if date_created > datetime.now():
        raise APIError(HTTPStatus.BAD_REQUEST, "account starting date in the future")
    if Currency.query.filter_by(user_id=current_user.id, id=currency_id).first() is None:
        raise APIError(HTTPStatus.BAD_REQUEST, "invalid currency_id")
    if not re.match('^#[a-fA-F0-9]{6}$', color):
        raise APIError(HTTPStatus.BAD_REQUEST, "color: invalid color hex-string")
    order = max([acc.order for acc in current_user.accounts] + [0]) + 1
    account = Account(desc=desc, starting_saldo=starting_saldo, order=order, color=color,
        date_created=date_created, currency_id=currency_id, user_id=current_user.id)
    db.session.add(account)
    db.session.commit()
    return '', HTTPStatus.CREATED

@accounts.route("/<int:account_id>/dependencies")
@login_required
def account_dependencies(account_id: int):
    acc = Account.query.filter_by(user_id=current_user.id, id=account_id).first()
    if acc is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    
    total = len(acc.transactions)
    total += len(acc.in_transfers)
    total += len(acc.out_transfers)

    return jsonify(total)

@accounts.route("/<int:account_id>/delete", methods=["DELETE"])
@login_required
def delete_account(account_id: int):
    acc = Account.query.filter_by(user_id=current_user.id, id=account_id).first()
    if acc is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    
    for trans in acc.transactions:
        for flow in trans.flows:
            db.session.delete(flow)
        for rec in trans.records:
            db.session.delete(rec)
        db.session.delete(trans)
    for tf in acc.in_transfers:
        db.session.delete(tf)
    for tf in acc.out_transfers:
        db.session.delete(tf)
    db.session.delete(acc)
    db.session.commit()

    return jsonify({}), HTTPStatus.OK