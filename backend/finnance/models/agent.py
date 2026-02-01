from sqlalchemy import func
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql.schema import UniqueConstraint

from finnance import db

from .json import JSONModel
from .transaction import Flow, Transaction


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

