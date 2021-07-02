from sqlalchemy.sql.schema import CheckConstraint, UniqueConstraint
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import func
from finnance import db

class Transaction(db.Model):
    __tablename__ = 'trans'
    input_format = "%d.%m.%Y %H:%M"

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    is_expense = db.Column(db.Boolean, nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey('currency.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id'))
    agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'), nullable=False)
    date_issued = db.Column(db.DateTime, nullable=False)
    comment = db.Column(db.String(120))

    account = db.relationship("Account", backref="transactions")
    agent = db.relationship("Agent", backref="transactions")
    currency = db.relationship("Currency", backref="transactions")

class Record(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    trans_id = db.Column(db.Integer, db.ForeignKey('trans.id'), nullable=False)

    trans = db.relationship('Transaction', backref='records')
    category = db.relationship('Category', backref='records')

    __table_args__ = (
        UniqueConstraint('category_id', 'trans_id'),
    )

class Flow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    is_debt = db.Column(db.Boolean, nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'), nullable=False)
    trans_id = db.Column(db.Integer, db.ForeignKey('trans.id'), nullable=False)

    agent = db.relationship('Agent', backref='flows')
    trans = db.relationship('Transaction', backref='flows')

    __table_args__ = (
        UniqueConstraint('agent_id', 'trans_id'),
    )

class AccountTransfer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    src_amount = db.Column(db.Float, nullable=False)
    dst_amount = db.Column(db.Float, nullable=False)
    src_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    dst_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    date_issued = db.Column(db.DateTime)
    comment = db.Column(db.String(120))

    src = db.relationship("Account", backref="out_transfers", foreign_keys=[src_id])
    dst = db.relationship("Account", backref="in_transfers", foreign_keys=[dst_id])

    __table_args__ = (
        CheckConstraint('src_id != dst_id'),
    )

class Currency(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(3), nullable=False, unique=True)
    decimals = db.Column(db.Integer, CheckConstraint("decimals >= 0"), nullable=False)

    def format(self, number: float) -> str:
        return "{n:,.{d}f}".format(n=number, d=self.decimals)

class Agent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    desc = db.Column(db.String(64), nullable=False, unique=True)

    @hybrid_property
    def uses(self):
        return len(self.transactions) + len(self.flows)

    @uses.expression
    def uses(cls):
        return func.count(Transaction.id) + func.count(Flow.id)

class Category(db.Model):
    # pylint: disable=no-member

    id = db.Column(db.Integer, primary_key=True)
    desc = db.Column(db.String(64), nullable=False)
    is_expense = db.Column(db.Boolean, nullable=False)
    usable = db.Column(db.Boolean, nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    color = db.Column(db.String(7), nullable=False)
    order = db.Column(db.Integer, nullable=False, unique=True)

    parent = db.relationship("Category", backref="children", remote_side=[id])

    __table_args__ = (
        CheckConstraint('parent_id != id'),
        UniqueConstraint('desc', 'is_expense')
    )