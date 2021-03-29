import enum
import os
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

    src_amount = db.Column(db.Float, nullable=False)
    dst_amount = db.Column(db.Float, nullable=False)
    src_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    dst_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    date_issued = db.Column(db.DateTime)

    src = db.relationship("Account", backref="out_transfers", foreign_keys=[src_id])
    dst = db.relationship("Account", backref="in_transfers", foreign_keys=[dst_id])

    __table_args__ = (
        CheckConstraint('src_id != dst_id'),
    )

class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    desc = db.Column(db.String(32), nullable=False, unique=True)
    starting_saldo = db.Column(db.Float, nullable=False, default=0)
    date_created = db.Column(db.DateTime, nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey('currency.id'), nullable=False)
    transactions = db.relationship("Transaction", backref="account", lazy='dynamic')

    class AnyChild():
        """A class that holds data of a Transaction or an AccountTransfer"""
        class ChildType(enum.Enum):
            AccountTransfer = enum.auto()
            Transaction = enum.auto()

        def __init__(self, row: dict, account):
            self.account = account
            self.date_issued = datetime.datetime.strptime(row.get('date_issued'), "%Y-%m-%d %H:%M:%S.%f")
            self.amount = float(row.get('amount'))
            self.is_expense = bool(row.get('is_expense'))
            self.agent = row.get('agent')
            self.agent_id = row.get('agent_id')
            self.category = row.get('cat')
            self.category_id = row.get('cat_id')
            self.comment = row.get('comment')
            self.id = int(row.get('id'))
            self._saldo = None
            self.type = self.ChildType.AccountTransfer if self.category == "transfer" else self.ChildType.Transaction

        def saldo(self, saldo: float = None, formatted=True):
            if saldo is not None:
                self._saldo = saldo
            return self.account.currency.format(self._saldo) if formatted else self._saldo
        
        def date_to_fmt(self) -> str:
            return self.date_issued.strftime(Transaction.input_format)

        def is_transfer(self) -> bool:
            return self.type is self.ChildType.AccountTransfer

        def is_transaction(self) -> bool:
            return self.type is self.ChildType.Transaction

        

    def to_dict(self, deep=True):
        d = {
            "id": self.id,
            "desc": self.desc,
            "starting_saldo": self.starting_saldo,
            "date_created": self.date_created.strftime('%d.%m.%Y'),
            "currency": self.currency.to_dict()
        }
        if deep:
            d["transactions"] = [transaction.to_dict() for transaction in self.transactions]
        
        return d

    def saldo_children(self, num=None, saldo_formatted=True):
        saldo = self.starting_saldo
        total = self.transactions.count() + len(self.in_transfers) + len(self.out_transfers)
        with open(os.path.join(os.path.dirname(__file__), '../static/sql/all_transactions.sql'), "r") as f:
            sql = f.read()

        children = []
        for i, entry in enumerate(db.session.execute(sql, {'id': self.id})):
            entry = self.AnyChild(dict(entry), self)
            if entry.is_expense:
                saldo -= entry.amount
            else:
                saldo += entry.amount
            entry.saldo(saldo)
            if num is None or total - i <= num:
                children.append(entry) 
        saldo = self.currency.format(saldo) if saldo_formatted else saldo
        return saldo, children[::-1]

    def saldo(self):
        return self.saldo_children(num=0)[0]
    
    def starting(self):
        return self.currency.format(self.starting_saldo)

class Currency(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(3), nullable=False, unique=True)
    decimals = db.Column(db.Integer, CheckConstraint("decimals >= 0"), nullable=False)
    accounts = db.relationship("Account", backref="currency", lazy=True)

    def format(self, number: float) -> str:
        return "{n:,.{d}f}".format(n=number, d=self.decimals)

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