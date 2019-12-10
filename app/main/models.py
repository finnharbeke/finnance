from app import db

class Transaction(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    account_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date_issued = db.Column(db.DateTime, nullable=False)
    comment = db.Column(db.String(120))
    agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'), nullable=False)

class Account(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    desc = db.Column(db.String(64), nullable=False)
    starting_saldo = db.Column(db.Float, nullable=False, default=0)
    date_created = db.Column(db.DateTime, nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey('currency.id'), nullable=False)
    transactions = db.relationship("Transaction", backref="accounts", lazy=True)

class Currency(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(3), nullable=False)

class Agent(db.Model):
    
    id = db.Column(db.Integer, primary_key=True)
    desc = db.Column(db.String(64), nullable=False)
    transactions = db.relationship("Transaction", backref="agents", lazy=True)