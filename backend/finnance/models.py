import json
from math import ceil
from flask import current_app
import sqlalchemy
from sqlalchemy.sql.schema import CheckConstraint, UniqueConstraint
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import func
from finnance import db, login_manager
from flask_login import UserMixin
import datetime as dt


class JSONModel:
    json_relations = []
    json_ignore = []

    @staticmethod
    def default(obj):
        if isinstance(obj, dt.datetime):
            return obj.isoformat()
        else:
            return str(obj)

    def api(self):
        return self.obj_to_api(self.json(deep=True))

    @staticmethod
    def obj_to_api(obj):
        return current_app.response_class(
            f"{json.dumps(obj, default=JSONModel.default)}\n",
            mimetype=current_app.config["JSONIFY_MIMETYPE"],
        )

    @staticmethod
    def jsonValue(obj):
        if isinstance(obj, db.Model):
            return obj.json(deep=False)
        if isinstance(obj, sqlalchemy.orm.collections.InstrumentedList
                      ) or isinstance(obj, list):
            return [item.json(deep=False) for item in obj]
        return obj

    def json(self, deep: bool):
        d = {
            key: self.jsonValue(value)
            for key, value in self.__dict__.items()
            if not (key.startswith('_') or key in self.json_ignore
                    or isinstance(value, db.Model) or isinstance(value, sqlalchemy.orm.collections.InstrumentedList))
        }
        # properties
        d.update({
            key: self.jsonValue(getattr(self, key))
            for key in vars(type(self))
            if isinstance(getattr(type(self), key), property)
        })
        d["type"] = type(self).__name__.lower()
        if deep:
            d.update({
                key: self.jsonValue(getattr(self, key))
                for key in self.json_relations
            })
        return d


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


class Account(db.Model, JSONModel):
    id = db.Column(db.Integer, primary_key=True)

    desc = db.Column(db.String(32), nullable=False)
    starting_saldo = db.Column(db.Integer, nullable=False)
    date_created = db.Column(db.DateTime, nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey(
        'currency.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    color = db.Column(db.String(7), nullable=False)
    order = db.Column(db.Integer, nullable=False)

    currency = db.relationship("Currency", backref="accounts")
    user = db.relationship("User", backref="accounts")

    __table_args__ = (
        UniqueConstraint('desc', 'user_id'),
        UniqueConstraint('order', 'user_id')
    )

    json_relations = ["currency"]

    def changes(self, num=None):
        saldos = [self.starting_saldo]
        changes = sorted(
            self.transactions + self.out_transfers + self.in_transfers,
            key=lambda ch: ch.date_issued
        )
        for change in changes:
            if type(change) is AccountTransfer:
                exp = change.src_id == self.id
                amount = change.src_amount if exp else change.dst_amount
            else:
                exp = change.is_expense
                amount = change.amount

            saldos.append(saldos[-1] + (amount if not exp else -amount))

        return changes[::-1] if num is None else changes[-num:][::-1], saldos[::-1]

    def jsonify_changes(self, pagesize, page, start=None, end=None, search: str = None):
        saldo = self.starting_saldo
        changes = sorted(
            self.transactions + self.out_transfers + self.in_transfers,
            key=lambda ch: ch.date_issued
        )
        filtered = []

        for i, change in enumerate(changes):
            if type(change) is AccountTransfer:
                exp = change.src_id == self.id
                amount = change.src_amount if exp else change.dst_amount
            else:
                exp = change.is_expense
                amount = change.amount

            saldo = saldo + (amount if not exp else -amount)

            if (start is not None and start > change.date_issued):
                continue
            if (end is not None and change.date_issued >= end):
                continue

            if type(change) is Transaction:
                desc = change.agent.desc
            elif change.src_id == self.id:
                desc = change.dst.desc
            else:
                desc = change.src.desc

            if (search is not None):
                inComment = search.lower() in change.comment.lower()
                inAgent = search.lower() in desc.lower()
                if not inComment and not inAgent:
                    continue

            filtered.append((saldo, desc, change))

        out = [{
            "type": "account_change",
            "acc_id": self.id,
            "saldo": saldo,
            "target": desc,
            "data": change.json(deep=False)
        }
            for (saldo, desc, change) in filtered[::-1][pagesize*page:pagesize*(page+1)]
        ]

        return JSONModel.obj_to_api({
            "pages": ceil(len(filtered) / pagesize),
            "changes": out
        })

    @property
    def saldo(self):
        return self.changes(num=1)[1][0]

    def starting(self):
        return self.currency.format(self.starting_saldo)


class Transaction(db.Model, JSONModel):
    __tablename__ = 'trans'
    input_format = "%d.%m.%Y %H:%M"

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    is_expense = db.Column(db.Boolean, nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey(
        'currency.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id'))
    agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'), nullable=False)
    date_issued = db.Column(db.DateTime, nullable=False)
    comment = db.Column(db.String(120))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship("User", backref="transactions")
    account = db.relationship("Account", backref="transactions")
    agent = db.relationship("Agent", backref="transactions")
    currency = db.relationship("Currency", backref="transactions")

    json_relations = ["account",
                      "agent", "currency", "records", "flows"]


class Record(db.Model, JSONModel):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey(
        'category.id'), nullable=False)
    trans_id = db.Column(db.Integer, db.ForeignKey('trans.id'), nullable=False)

    trans = db.relationship('Transaction', backref='records')
    category = db.relationship('Category', backref='records')

    __table_args__ = (
        UniqueConstraint('category_id', 'trans_id'),
    )

    json_relations = ["trans", "category"]


class Flow(db.Model, JSONModel):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    is_debt = db.Column(db.Boolean, nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'), nullable=False)
    trans_id = db.Column(db.Integer, db.ForeignKey('trans.id'), nullable=False)

    agent = db.relationship('Agent', backref='flows')
    trans = db.relationship('Transaction', backref='flows')

    __table_args__ = (
        UniqueConstraint('agent_id', 'trans_id'),
    )

    json_relations = ["trans", "agent"]


class AccountTransfer(db.Model, JSONModel):
    id = db.Column(db.Integer, primary_key=True)
    src_amount = db.Column(db.Integer, nullable=False)
    dst_amount = db.Column(db.Integer, nullable=False)
    src_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    dst_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    date_issued = db.Column(db.DateTime)
    comment = db.Column(db.String(120))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship("User", backref="transfers")
    src = db.relationship(
        "Account", backref="out_transfers", foreign_keys=[src_id])
    dst = db.relationship(
        "Account", backref="in_transfers", foreign_keys=[dst_id])

    __table_args__ = (
        CheckConstraint('src_id != dst_id'),
    )

    json_relations = ["src", "dst"]


class Currency(db.Model, JSONModel):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(3), nullable=False)
    decimals = db.Column(db.Integer, CheckConstraint(
        "decimals >= 0"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship("User", backref="currencies")
    __table_args__ = (
        UniqueConstraint('code', 'user_id'),
    )

    json_relations = ["accounts"]

    def format(self, number: int) -> str:
        return "{n:,.{d}f}".format(n=number / (10 ** self.decimals), d=self.decimals)


class Agent(db.Model, JSONModel):
    id = db.Column(db.Integer, primary_key=True)
    desc = db.Column(db.String(64), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship("User", backref="agents")

    __table_args__ = (
        UniqueConstraint('desc', 'user_id'),
    )

    json_relations = ["transactions", "flows"]

    @hybrid_property
    def uses(self):
        return len(self.transactions) + len(self.flows)

    @uses.expression
    def uses(cls):
        return func.count(Transaction.id) + func.count(Flow.id)


class Category(db.Model, JSONModel):
    id = db.Column(db.Integer, primary_key=True)
    desc = db.Column(db.String(64), nullable=False)
    is_expense = db.Column(db.Boolean, nullable=False)
    usable = db.Column(db.Boolean, nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    color = db.Column(db.String(7), nullable=False)
    order = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship("User", backref="categories")

    # parent = db.relationship("Category", remote_side=[id])

    @property
    def parent(self):
        return Category.query.filter_by(id=self.parent_id).first()

    __table_args__ = (
        UniqueConstraint('user_id', 'desc', 'is_expense'),
        UniqueConstraint('user_id', 'order', 'is_expense')
    )

    json_relations = ["records"]
