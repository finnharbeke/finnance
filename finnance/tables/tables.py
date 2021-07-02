from flask import Blueprint
from finnance.main.controllers import dated_url_for

tables = Blueprint('tables', __name__, template_folder='templates')

@tables.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)