from sqlalchemy.sql.schema import UniqueConstraint

from finnance import db

from .json import JSONModel


class TransactionTemplate(db.Model, JSONModel):
    __tablename__ = 'template'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    desc = db.Column(db.String(64), nullable=False)
    order = db.Column(db.Integer, nullable=False)

    account_id = db.Column(db.Integer, db.ForeignKey('account.id'))
    currency_id = db.Column(db.Integer, db.ForeignKey('currency.id'))
    amount = db.Column(db.Integer)
    is_expense = db.Column(db.Boolean, nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'))
    comment = db.Column(db.String(120), nullable=False)

    direct = db.Column(db.Boolean, nullable=False)
    remote_agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'))

    user = db.relationship("User", backref="templates")
    account = db.relationship("Account", backref="templates")
    agent = db.relationship("Agent", backref="templates", foreign_keys=[agent_id])
    remote_agent = db.relationship("Agent", backref="remote_templates",
                                   foreign_keys=[remote_agent_id])
    currency = db.relationship("Currency", backref="templates")

    __table_args__ = (
        UniqueConstraint('order', 'user_id'),
    )

    json_relations = ["agent", "remote_agent", "records", "flows"]

class FlowTemplate(db.Model, JSONModel):
    id = db.Column(db.Integer, primary_key=True)

    template_id = db.Column(db.Integer, db.ForeignKey('template.id'), nullable=False)
    amount = db.Column(db.Integer)
    agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'))
    ix = db.Column(db.Integer, nullable=False)

    @property
    def agent_desc(self):
        return self.agent.desc if self.agent is not None else None

    agent = db.relationship("Agent")
    template = db.relationship("TransactionTemplate", backref="flows")

class RecordTemplate(db.Model, JSONModel):
    id = db.Column(db.Integer, primary_key=True)

    template_id = db.Column(db.Integer, db.ForeignKey('template.id'), nullable=False)
    amount = db.Column(db.Integer)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    ix = db.Column(db.Integer, nullable=False)

    category = db.relationship("Category")
    template = db.relationship("TransactionTemplate", backref="records")