from flask import Blueprint, render_template

module = Blueprint('anal', __name__)

@module.route('/')
def analysis():
    return render_template('main/dashboard.j2')