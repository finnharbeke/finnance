from flask import Blueprint, render_template, abort, request
from flask_login import login_required, current_user
import datetime as dt
from finnance.models import Currency, Account
from finnance.main.controllers import dated_url_for
from dateutil.relativedelta import relativedelta as delta

from finnance.queries import account_filter

anal = Blueprint('anal', __name__, url_prefix='/analysis', 
    static_folder='static', template_folder='templates',
    static_url_path='/static/analysis')

@anal.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def params():
    return dict(
        currencies=Currency.query.all(),
        accounts=account_filter()
    )

@anal.route('')
@login_required
def analysis():
    req = request.args.to_dict()
    now = dt.datetime.now()
    end = now.isoformat()
    start = (dt.datetime(now.year, now.month, 1) - delta(months=11)).isoformat()
    req.update({'start': start, 'end': end})
    query = ""
    for key in req:
        query += f"&{key}={req[key]}"
    return render_template('dashboard.j2', query=query[1:], **params())

@anal.route("/<int:year>/<int:month>")
@login_required
def d3(year, month):
    try:
        dt.datetime(year=year, month=month, day=1)
    except Exception as e:
        return abort(404)
    req = request.args.to_dict()
    start = dt.datetime(year, month, 1)
    end = dt.datetime(year + (month == 12), 1 if month == 12 else month + 1, 1)
    req.update({'start': start.isoformat(), 'end': end.isoformat()})
    query = ""
    for key in req:
        query += f"&{key}={req[key]}"
    return render_template("monthly.j2", year=year, month=month, query=query[1:], **params())