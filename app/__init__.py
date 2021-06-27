# Import flask and template operators
from flask import Flask, render_template, url_for
from flask_sqlalchemy import SQLAlchemy

# Define the WSGI application object
app = Flask(__name__)

# Configurations
app.config.from_object('config')

# Define the database object which is imported
# by modules and controllers
db = SQLAlchemy(app)

# Sample HTTP error handling
@app.errorhandler(404)
def not_found(error):
    return render_template('error.j2', title="404", desc="Page Not Found!", link=url_for("main.index"), link_text="Home"), 404

# Import a module / component using its blueprint handler variable (mod_auth)
from app.main.controllers import mod_main as main_module
from app.main.api import mod_api as api_module
from app.main.modal import mod_modal as modal_module
from app.analysis import anal, anal_api

# Register blueprint(s)
app.register_blueprint(main_module)
app.register_blueprint(api_module)
app.register_blueprint(modal_module)
app.register_blueprint(anal)
app.register_blueprint(anal_api)
# app.register_blueprint(xyz_module)
# ..

# Build the database:
# This will create the database file using SQLAlchemy
db.create_all()