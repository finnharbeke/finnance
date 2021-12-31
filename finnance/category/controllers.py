from flask import Blueprint, render_template, jsonify, redirect, url_for, request
from flask_login import login_required, current_user
from sqlalchemy import func
from finnance.models import Category, Account
from finnance.main.controllers import dated_url_for
from finnance import db

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

@category.route('/add', methods=["POST"])
@login_required
def add():
    desc = request.form.get("desc")
    color = request.form.get("color")
    is_expense = request.form.get("catExpinc") == 'expense'
    locked = request.form.get("lock") != 'false'
    if is_expense:
        parent_id = request.form.get("parentExp")
    else:
        parent_id = request.form.get("parentInc")
    parent_id = int(parent_id) if parent_id != "none" else None
    max_order, = db.session.query(func.max(Category.order)).filter_by(user_id=current_user.id).first()
    max_order = 0 if max_order is None else max_order
    category = Category(desc=desc, is_expense=is_expense, usable=not locked,
        parent_id=parent_id, color=color, order=max_order+1, user_id=current_user.id)

    db.session.add(category)
    db.session.commit()
    return redirect(url_for('category.dashboard'))

@category.route("/api")
@login_required
def categories():
    cats = Category.query.filter_by(user_id=current_user.id).order_by(Category.order)
    dct = lambda cat: {'color': cat.color, 'desc': cat.desc, 'id': cat.id}
    return jsonify({
        'expenses': [dct(cat) for cat in cats.filter_by(is_expense=True)],
        'income': [dct(cat) for cat in cats.filter_by(is_expense=False)]
    })