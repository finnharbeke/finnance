from datetime import datetime
from math import ceil

from finnance.params import parseSearchParams
from finnance.models import Record, Transaction, JSONModel
from flask import Blueprint, request
from flask_login import current_user, login_required

records = Blueprint('records', __name__, url_prefix='/api/records')

@records.route("")
@login_required
def get_records():
    kwargs = parseSearchParams(request.args.to_dict(), dict(
        start=datetime, end=datetime, search=str, categories=str
    ))

    result = Record.query.join(Transaction).filter_by(user_id=current_user.id).order_by(Transaction.date_issued.desc())
    if 'start' in kwargs:
        result = result.filter(Transaction.date_issued >= kwargs.get('start'))
    if 'end' in kwargs:
        result = result.filter(Transaction.date_issued < kwargs.get('end'))
    if 'categories' in kwargs:
        categories_ids = [int(i) for i in kwargs.get('categories').strip().split(',')]
        result = result.filter(Record.category_id.in_(categories_ids))

    pagesize = kwargs.get('pagesize')
    page = kwargs.get('page')

    # search filter
    result = list(filter(
        lambda r: 'search' not in kwargs or any(
            kwargs['search'].lower() in string for string in [
                r.trans.comment.lower(),
                r.category.desc.lower(),
        ]),
        result.all()
    ))
    return JSONModel.obj_to_api(dict(
        pages= ceil(len(result) / pagesize),
        records=[
        record.json(deep=True)
        for record in result[pagesize*page:pagesize*(page+1)]
    ]))