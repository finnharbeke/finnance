from sqlalchemy.sql.schema import UniqueConstraint

from finnance import db


class Transaction(db.Model, JSONModel):
    __tablename__ = 'trans'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    is_expense = db.Column(db.Boolean, nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey(
        'currency.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id'))
    agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'), nullable=False)
    date_issued = db.Column(db.DateTime, nullable=False)
    comment = db.Column(db.String(120), nullable=False)
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

    @property
    def agent_desc(self):
        return self.agent.desc

    __table_args__ = (
        UniqueConstraint('agent_id', 'trans_id'),
    )

    json_relations = ["trans", "agent"]

