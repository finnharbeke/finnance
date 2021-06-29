from flask import Blueprint, render_template, url_for
import datetime as dt
from app.main.account import Account
from app.main.models import Currency

anal = Blueprint('anal', __name__, url_prefix='/analysis', 
    static_folder='static', template_folder='templates')

def params():
    return dict(
        currencies=Currency.query.all(),
        accounts=Account.query.all(),
        timestamp=dt.datetime.utcnow()
    )

@anal.route('')
def analysis():
    return render_template('dashboard.j2', **params())

@anal.route("/<int:year>/<int:month>")
def d3(year, month):
    try:
        dt.datetime(year=year, month=month, day=1)
    except Exception as e:
        return render_template("error.j2", title="Invalid Year & Month!",
            desc="", link=url_for('main.index'), link_text="Go to Home")
    return render_template("monthly.j2", year=year, month=month, **params())