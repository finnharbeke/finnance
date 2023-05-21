from datetime import datetime
from math import ceil

from finnance.params import parseSearchParams
from finnance.models import Flow, Transaction, JSONModel
from flask import Blueprint, request
from flask_login import current_user, login_required

flows = Blueprint('flows', __name__, url_prefix='/api/flows')

@flows.route("")
@login_required
def get_flows():
    kwargs = parseSearchParams(request.args.to_dict(), dict(
        start=datetime, end=datetime, search=str
    ))

    result = Flow.query.join(Transaction).filter_by(user_id=current_user.id).order_by(Transaction.date_issued.desc())
    if 'start' in kwargs:
        result = result.filter(Transaction.date_issued >= kwargs.get('start'))
    if 'end' in kwargs:
        result = result.filter(Transaction.date_issued < kwargs.get('end'))
    
    pagesize = kwargs.get('pagesize')
    page = kwargs.get('page')

    # search filter
    result = list(filter(
        lambda f: 'search' not in kwargs or any(
            kwargs['search'].lower() in string for string in [
                f.trans.comment.lower(),
                f.agent.desc.lower(),
        ]),
        result.all()
    ))
    return JSONModel.obj_to_api(dict(
        pages= ceil(len(result) / pagesize),
        flows=[
        flow.json(deep=True)
        for flow in result[pagesize*page:pagesize*(page+1)]
    ]))