from flask import Blueprint, render_template, jsonify
from app.main.account import Account
from app.main.models import Category
import datetime as dt

blueprint = Blueprint('category', __name__, url_prefix='/category',
    static_folder='static', template_folder='templates')

print(blueprint.root_path)

def params():
    return dict(
        accounts=Account.query.all(),
        timestamp=dt.datetime.utcnow()
    )

@blueprint.route('/')
def dashboard():
    return render_template('category.j2', **params())

@blueprint.route("/api")
def categories():
    cats = Category.query.order_by(Category.order)
    dct = lambda cat: {'color': cat.color, 'desc': cat.desc, 'id': cat.id}
    return jsonify({
        'expenses': [dct(cat) for cat in cats.filter_by(is_expense=True)],
        'income': [dct(cat) for cat in cats.filter_by(is_expense=False)]
    })