import re
from datetime import datetime
from http import HTTPStatus

from flask import Blueprint, jsonify
from flask_login import current_user, login_required

from finnance import db
from finnance.errors import APIError, validate
from finnance.models import Account, AccountTransfer, Currency

transfers = Blueprint('transfers', __name__, url_prefix='/api/transfers')

@transfers.route("/<int:transfer_id>")
@login_required
def transfer(transfer_id: int):
    transfer = AccountTransfer.filter_by(user_id=current_user.id, id=transfer_id).first()
    if transfer is None:
        raise APIError(HTTPStatus.NOT_FOUND)

    return transfer.api()

@transfers.route("/add", methods=["POST"])
@login_required
@validate({
    "type": "object",
    "properties": {
        "src_id": {"type": "integer"},
        "dst_id": {"type": "integer"},
        "src_amount": {"type": "integer"},
        "dst_amount": {"type": "integer"},
        "date_issued": {"type": "string"},
        "comment": {"type": "string"},
    },
    "required": ["src_id", "dst_id", "src_amount", "dst_amount", "date_issued", "comment"]
})
def add_transfer(src_id: int, dst_id: int, src_amount: int, dst_amount: int, date_issued: str, comment: str):
    source = Account.query.filter_by(user_id=current_user.id, id=src_id).first()
    if source is None:
        raise APIError(HTTPStatus.BAD_REQUEST, "src_id invalid")
    
    destination = Account.query.filter_by(user_id=current_user.id, id=dst_id).first()
    if destination is None:
        raise APIError(HTTPStatus.BAD_REQUEST, "dst_id invalid")

    try:
        date_issued = datetime.fromisoformat(date_issued)
    except ValueError:
        raise APIError(HTTPStatus.BAD_REQUEST, "date_issued: invalid isoformat")

    if date_issued < source.date_created or date_issued < destination.date_created:
        raise APIError(HTTPStatus.BAD_REQUEST, 'date_issued before the accounts starting dates')

    transfer = AccountTransfer(src_id=src_id, dst_id=dst_id, src_amount=src_amount, dst_amount=dst_amount,
        date_issued=date_issued, comment=comment, user_id=current_user.id)
    db.session.add(transfer)
    db.session.commit()
    return HTTPStatus.CREATED

@transfers.route("/<int:transfer_id>/edit", methods=["PUT"])
@login_required
@validate({
    "type": "object",
    "properties": {
        "src_id": {"type": "integer"},
        "dst_id": {"type": "integer"},
        "src_amount": {"type": "integer"},
        "dst_amount": {"type": "integer"},
        "date_issued": {"type": "string"},
        "comment": {"type": "string"},
    },
})
def edit_transfer(transfer_id: int, **data):
    transfer = AccountTransfer.query.filter_by(user_id=current_user, id=transfer_id).first()
    if transfer is None:
        raise APIError(HTTPStatus.NOT_FOUND)


    source = transfer.src
    if 'src_id' in data:
        source = Account.query.filter_by(user_id=current_user.id, id=data['src_id']).first()
        if source is None:
            raise APIError(HTTPStatus.BAD_REQUEST, "src_id invalid")

        transfer.src_id = source.id
    
    destination = transfer.dst
    if 'dst_id' in data:
        destination = Account.query.filter_by(user_id=current_user.id, id=data['dst_id']).first()
        if destination is None:
            raise APIError(HTTPStatus.BAD_REQUEST, "dst_id invalid")

        transfer.dst_id = destination.id

    if 'date_issued' in data:
        try:
            date_issued = datetime.fromisoformat(data['date_issued'])
        except ValueError:
            raise APIError(HTTPStatus.BAD_REQUEST, "date_issued: invalid isoformat")
        
        if date_issued < source.date_created or date_issued < destination.date_created:
            raise APIError(HTTPStatus.BAD_REQUEST, 'date_issued before the accounts starting dates')
        
        transfer.date_issued = date_issued

    if 'src_amount' in data:
        transfer.src_amount = data['src_amount']
    if 'dst_amount' in data:
        transfer.dst_amount = data['dst_amount']
    if 'comment' in data:
        transfer.comment = data['comment']

    db.session.commit()
    return HTTPStatus.CREATED