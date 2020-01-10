from app import db
import datetime

class Transaction(db.Model):
    # pylint: disable=no-member
    id = db.Column(db.Integer, primary_key=True)

    account_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date_issued = db.Column(db.DateTime, nullable=False)
    comment = db.Column(db.String(120))
    agent_id = db.Column(db.Integer, db.ForeignKey('agent.id'), nullable=False)

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
        "currency": currency.to_dict()
    }

    def agent(self):
        return Agent.query.get(self.agent_id).desc

class Account(db.Model):
    # pylint: disable=no-member
    id = db.Column(db.Integer, primary_key=True)

    desc = db.Column(db.String(32), nullable=False, unique=True)
    starting_saldo = db.Column(db.Float, nullable=False, default=0)
    date_created = db.Column(db.DateTime, nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey('currency.id'), nullable=False)
    transactions = db.relationship("Transaction", backref="accounts", lazy=True)

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

    def currency(self):
        return Currency.query.get(self.currency_id).code

class Currency(db.Model):
    # pylint: disable=no-member
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(3), nullable=False, unique=True)

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code
        }

class Agent(db.Model):
    # pylint: disable=no-member
    
    id = db.Column(db.Integer, primary_key=True)
    desc = db.Column(db.String(64), nullable=False, unique=True)
    transactions = db.relationship("Transaction", backref="agents", lazy=True)

    def to_dict(self, deep=True):
        d = {
            "id": self.id,
            "desc": self.desc
        }
        if deep:
            d["transactions"] = [transaction.to_dict() for transaction in self.transactions]
        
        return d