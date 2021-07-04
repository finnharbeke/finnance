from flask import Blueprint, render_template, abort
import datetime as dt
from finnance.models import Currency, Account
from finnance.main.controllers import dated_url_for

anal = Blueprint('anal', __name__, url_prefix='/analysis', 
    static_folder='static', template_folder='templates',
    static_url_path='/static/analysis')

@anal.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def params():
    return dict(
        currencies=Currency.query.all(),
        accounts=Account.query.all()
    )

@anal.route('')
def analysis():
    return render_template('dashboard.j2', **params())

@anal.route("/<int:year>/<int:month>")
def d3(year, month):
    try:
        dt.datetime(year=year, month=month, day=1)
    except Exception as e:
        return abort(404)
    return render_template("monthly.j2", year=year, month=month, **params())