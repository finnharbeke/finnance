from sqlalchemy.sql.schema import CheckConstraint, UniqueConstraint
from app import db
import datetime
from sqlalchemy import ForeignKeyConstraint

class Transaction(db.Model):
    input_format = "%d.%m.%Y %H:%M"

    __tablename__ = 'trans'
    id = db.Column(db.Integer, primary_key=True)

    account_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date_issued = db.Column(db.DateTime, nullable=False)
    comment = db.Column(db.String(120))
    agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)

    def is_expense(self):
        return self.category.is_expense

    def date_to_fmt(self) -> str:
        return self.date_issued.strftime(Transaction.input_format)

    def to_dict(self):
        account = Account.query.get(self.account_id)
        currency = Currency.query.get(account.currency_id)
        agent = Agent.query.get(self.agent_id)

        return {
        "id": self.id,
        "account": account.to_dict(deep=False),
        "amount": self.amount,
        "agent": agent.to_dict(deep=False),
        "comment": self.comment,
        "date": self.date_issued.strftime('%d.%m.%Y'),
        "time": self.date_issued.strftime('%H:%M'),
        "currency": currency.to_dict(),
        "is_expenst": self.is_expense
    }

class Flow(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    amount = db.Column(db.Float, nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'))
    date_issued = db.Column(db.DateTime)
    trans_id = db.Column(db.Integer, db.ForeignKey('trans.id'))

    __table_args__ = (
        CheckConstraint('date_issued IS NULL <> trans_id IS NULL'),
        UniqueConstraint('agent_id', 'trans_id')
    )

class AccountTransfer(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    amount = db.Column(db.Float, nullable=False)
    src_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    dest_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    date_issued = db.Column(db.DateTime)

    __table_args__ = (
        CheckConstraint('src_id != dest_id'),
    )

class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    desc = db.Column(db.String(32), nullable=False, unique=True)
    starting_saldo = db.Column(db.Float, nullable=False, default=0)
    date_created = db.Column(db.DateTime, nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey('currency.id'), nullable=False)
    transactions = db.relationship("Transaction", backref="account", lazy=True)

    def to_dict(self, deep=True):
        currency = Currency.query.get(self.currency_id)

        d = {
            "id": self.id,
            "desc": self.desc,
            "starting_saldo": self.starting_saldo,
            "date_created": self.date_created.strftime('%d.%m.%Y'),
            "currency": currency.to_dict()
        }
        if deep:
            d["transactions"] = [transaction.to_dict() for transaction in self.transactions]
        
        return d

    def saldo(self):
        saldo = self.starting_saldo
        for t in Transaction.query.filter_by(account_id=self.id).order_by(Transaction.date_issued).all():
            saldo -= t.amount
        return saldo

    def saldo_formatted(self):
        return f"{round(abs(self.saldo()), 2):,.2f}"

class Currency(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(3), nullable=False, unique=True)
    accounts = db.relationship("Account", backref="currency", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code
        }

class Agent(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    desc = db.Column(db.String(64), nullable=False, unique=True)
    transactions = db.relationship("Transaction", backref="agent", lazy=True)

    def to_dict(self, deep=True):
        d = {
            "id": self.id,
            "desc": self.desc
        }
        if deep:
            d["transactions"] = [transaction.to_dict() for transaction in self.transactions]
        
        return d

class Category(db.Model):
    # pylint: disable=no-member

    id = db.Column(db.Integer, primary_key=True)
    desc = db.Column(db.String(64), nullable=False)
    is_expense = db.Column(db.Boolean, nullable=False, default=1)
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    children = db.relationship("Category", lazy=True)
    transactions = db.relationship("Transaction", backref="category", lazy=True)

    __table_args__ = (
        CheckConstraint('parent_id != id'),
        UniqueConstraint('desc', 'is_expense')
    )

    def to_dict(self, deep=True):
        d = {
            "id": self.id,
            "desc": self.desc,
            "is_expense": self.is_expense,
            "parent": Category.query.get(self.parent_id) if self.parent_id else None,
            "children": [category.to_dict(deep=False) for category in self.children]
        }
        if deep:
            d["transactions"] = [transaction.to_dict() for transaction in self.transactions]
        
        return d