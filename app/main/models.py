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
        return self.category.is_expense if self.category_id is not None else not self.direct_flow_in

    def api(self, deep=False):
        cat = self.category_id is not None
        return {
            "type": "categorized" if cat else "flow",
            "id": self.id,
            "account": self.account.api() if deep else self.account.id,
            "is_expense": self.is_expense(),
            "amount": self.amount,
            "agent": self.agent.api() if deep else self.agent.id,
            "comment": self.comment,
            "date_issued": self.date_issued.strftime('%d.%m.%Y %H:%M'),
            "currency": self.account.currency.api() if deep else self.account.currency.id,
            "category": self.category.api() if cat and deep else self.category.id if cat else None
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

    def api(self, deep=False):
        return {
            "id": self.id,
            "amount": self.amount,
            "agent": self.agent.api() if deep else self.agent.id,
            "transaction": self.trans.api() if deep else self.trans.id
        }

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

    def api(self, deep=False):
        return {
            "id": self.id,
            "amount": self.amount,
            "is_expense": self.is_expense,
            "date_issued": self.date_issued,
            "flow_agent": self.flow_agent.api() if deep else self.flow_agent.id,
            "trans_agent": self.trans_agent.api() if deep else self.trans_agent.id,
            "category": self.category.api(),
            "currency": self.currency.api(),
            "comment": self.comment
        }

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

    def api(self, deep=False):
        return {
            "id": self.id,
            "src_amount": self.src_amount,
            "dst_amount": self.dst_amount,
            "src": self.src.api() if deep else self.src.id,
            "dst": self.dst.api() if deep else self.dst.id,
            "date_issued": self.date_issued.strftime("%d.%m.%Y %H:%M"),
            "comment": self.comment
        }

class Currency(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(3), nullable=False, unique=True)
    decimals = db.Column(db.Integer, CheckConstraint("decimals >= 0"), nullable=False)
    accounts = db.relationship("Account", backref="currency", lazy=True)
    remote_flows = db.relationship("RemoteFlow", backref="currency", lazy=True)

    def format(self, number: float) -> str:
        return "{n:,.{d}f}".format(n=number, d=self.decimals)

    def api(self, deep=False):
        d = {
            "id": self.id,
            "code": self.code,
            "decimals": self.decimals,
        }
        if deep:
            d["accounts"] = [acc.id for acc in self.accounts]
            d["remote_flows"] = [fl.id for fl in self.remote_flows]
        return d

class Agent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    desc = db.Column(db.String(64), nullable=False, unique=True)
    transactions = db.relationship("Transaction", backref="agent", lazy=True)
    flows = db.relationship("Flow", backref="agent", lazy=True)

    def api(self, deep=False):
        d = {
            "id": self.id,
            "desc": self.desc,
        }
        if deep:
            d["flows"] = [flow.id for flow in self.flows]
            d["remote_flows"] = [flow.id for flow in self.remote_flows]
            d["remotes"] = [tr.id for tr in self.remotes]
            d["transactions"] = [tr.id for tr in self.transactions]
        
        return d

class Category(db.Model):
    # pylint: disable=no-member

    id = db.Column(db.Integer, primary_key=True)
    desc = db.Column(db.String(64), nullable=False)
    is_expense = db.Column(db.Boolean, nullable=False)
    usable = db.Column(db.Boolean, nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    parent = db.relationship("Category", backref="children", remote_side=[id], lazy=True)
    transactions = db.relationship("Transaction", backref="category", lazy=True)
    remote_flows = db.relationship("RemoteFlow", backref="category", lazy=True)

    __table_args__ = (
        CheckConstraint('parent_id != id'),
        UniqueConstraint('desc', 'is_expense')
    )

    def api(self, deep=False):
        d = {
            "id": self.id,
            "desc": self.desc,
            "is_expense": self.is_expense,
            "parent": self.parent.api() if self.parent_id is not None else None,
            "children": [category.api() for category in self.children] if deep else [category.id for category in self.children]
        }
        if deep:
            d["transactions"] = [tr.id for tr in self.transactions]
            d["remote_flows"] = [fl.id for fl in self.remote_flows]
        
        return d