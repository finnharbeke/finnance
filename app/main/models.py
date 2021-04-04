from sqlalchemy.sql.schema import CheckConstraint, UniqueConstraint
from app import db

class Transaction(db.Model):
    input_format = "%d.%m.%Y %H:%M"

    __tablename__ = 'trans'
    id = db.Column(db.Integer, primary_key=True)

    account_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date_issued = db.Column(db.DateTime, nullable=False)
    comment = db.Column(db.String(120))
    agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    direct_flow_in = db.Column(db.Boolean)

    __table_args__ = (
        CheckConstraint('(direct_flow_in IS NULL) <> (category_id IS NULL)'),
    )

    def is_expense(self):
        return self.category.is_expense

    def to_dict(self):
        currency = Currency.query.get(self.account.currency_id)
        agent = Agent.query.get(self.agent_id)

        return {
            "id": self.id,
            "account": self.account.to_dict(deep=False),
            "amount": self.amount,
            "agent": agent.to_dict(deep=False),
            "comment": self.comment,
            "date": self.date_issued.strftime('%d.%m.%Y'),
            "time": self.date_issued.strftime('%H:%M'),
            "currency": currency.to_dict(),
            "is_expense": self.is_expense()
        }

class Flow(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    amount = db.Column(db.Float, nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'), nullable=False)
    trans_id = db.Column(db.Integer, db.ForeignKey('trans.id'), nullable=False)

    trans = db.relationship('Transaction', backref='flows', foreign_keys=[trans_id])

    __table_args__ = (
        UniqueConstraint('agent_id', 'trans_id'),
    )

class RemoteFlow(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    amount = db.Column(db.Float, nullable=False)
    is_expense = db.Column(db.Float, nullable=False)
    date_issued = db.Column(db.DateTime, nullable=False)
    flow_agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'), nullable=False)
    trans_agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey('currency.id'), nullable=False)
    comment = db.Column(db.String(120))

    flow_agent = db.relationship('Agent', backref='remote_flows', foreign_keys=[flow_agent_id])
    trans_agent = db.relationship('Agent', backref='remotes', foreign_keys=[trans_agent_id]) 

    __table_args__ = (
        CheckConstraint('flow_agent_id != trans_agent_id'),
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
    flows = db.relationship("Flow", backref="agent", lazy=True)

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
    is_expense = db.Column(db.Boolean, nullable=False)
    usable = db.Column(db.Boolean, nullable=False)
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