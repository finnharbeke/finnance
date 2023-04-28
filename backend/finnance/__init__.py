# Import flask and template operators
import json
import traceback
from http import HTTPStatus

from flask import Blueprint, Flask, current_app, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from jsonschema import Draft202012Validator, ValidationError

from finnance.errors.errors import APIError

# Define the WSGI application object
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configurations
app.config.from_object('finnance.config')
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)

# Define the database object which is imported
# by modules and controllers
db = SQLAlchemy(app)
from . import models

with app.app_context():
    db.create_all()


from finnance.accounts import accounts
from finnance.agents import agents
# Import a module / component using its blueprint handler variable
from finnance.auth import auth
from finnance.categories import categories
from finnance.currencies import currencies
from finnance.transactions import transactions
from finnance.transfers import transfers
from finnance.nivo import nivo

# Register blueprints
app.register_blueprint(auth)
app.register_blueprint(accounts)
app.register_blueprint(categories)
app.register_blueprint(currencies)
app.register_blueprint(agents)
app.register_blueprint(transactions)
app.register_blueprint(transfers)
app.register_blueprint(nivo)

# ERROR HANDLING
################

@app.errorhandler(APIError)
def handle_apierror(err: APIError):
    return err.msg, err.status.value

@app.errorhandler(404)
def handle_404(e):
    return handle_apierror(APIError(HTTPStatus.NOT_FOUND))

@app.errorhandler(Exception)
def handle_exception(err: Exception):
    app = current_app
    app.logger.error(f"Unknown Exception: {str(err)}")
    app.logger.debug(''.join(
        traceback.format_exception(type(err), value=err, tb=err.__traceback__))
    )
    return handle_apierror(APIError(HTTPStatus.INTERNAL_SERVER_ERROR, str(err)))

@login_manager.unauthorized_handler
def unauthorized():
    raise APIError(HTTPStatus.UNAUTHORIZED)