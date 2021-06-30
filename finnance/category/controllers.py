from flask import Blueprint, render_template, jsonify
from finnance.account import Account
from finnance.models import Category
from finnance.main.controllers import dated_url_for

category = Blueprint('category', __name__, url_prefix='/category',
    static_folder='static', template_folder='templates',
    static_url_path='/static/category')

@category.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def params():
    return dict(
        accounts=Account.query.all(),
    )

@category.route('/')
def dashboard():
    return render_template('category.j2', **params())

@category.route("/api")
def categories():
    cats = Category.query.order_by(Category.order)
    dct = lambda cat: {'color': cat.color, 'desc': cat.desc, 'id': cat.id}
    return jsonify({
        'expenses': [dct(cat) for cat in cats.filter_by(is_expense=True)],
        'income': [dct(cat) for cat in cats.filter_by(is_expense=False)]
    })