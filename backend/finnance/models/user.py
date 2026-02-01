from flask_login import UserMixin

from finnance import db, login_manager

from .json import JSONModel


class User(db.Model, JSONModel, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), nullable=False, unique=True)
    email = db.Column(db.String(64), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

    @staticmethod
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    json_relations = ["accounts"]
    json_ignore = ["password"]
