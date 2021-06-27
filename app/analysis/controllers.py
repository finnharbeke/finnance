from flask import Blueprint, render_template, url_for
import datetime as dt
from app.main.account import Account

anal = Blueprint('anal', __name__, url_prefix='/analysis',
    static_folder='static', template_folder='templates')

@anal.route('/')
def analysis():
    accounts = Account.query.all()
    return render_template('dashboard.j2', accounts=accounts)

@anal.route("/<int:year>/<int:month>")
def d3(year, month):
    accounts = Account.query.all()
    try:
        dt.datetime(year=year, month=month, day=1)
    except Exception as e:
        print(e)
        return render_template("error.j2", title="Invalid Year & Month!",
            desc="", link=url_for('main.index'), link_text="Go to Home")
    return render_template("d3.j2", year=year, month=month,
        accounts=accounts, timestamp=dt.datetime.utcnow())