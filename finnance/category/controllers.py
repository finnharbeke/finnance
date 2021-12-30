from flask import Blueprint, render_template, jsonify
from flask_login import login_required, current_user
from finnance.models import Category, Account
from finnance.main.controllers import dated_url_for

category = Blueprint('category', __name__, url_prefix='/category',
    static_folder='static', template_folder='templates',
    static_url_path='/static/category')

@category.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def params():
    return dict(
        accounts=Account.query.filter_by(user_id=current_user.id).all(),
    )

@category.route('/')
@login_required
def dashboard():
    return render_template('category.j2', **params())

@category.route("/api")
@login_required
def categories():
    cats = Category.query.filter_by(user_id=current_user.id).order_by(Category.order)
    dct = lambda cat: {'color': cat.color, 'desc': cat.desc, 'id': cat.id}
    return jsonify({
        'expenses': [dct(cat) for cat in cats.filter_by(is_expense=True)],
        'income': [dct(cat) for cat in cats.filter_by(is_expense=False)]
    })