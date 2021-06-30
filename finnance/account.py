from finnance.change import Change
from finnance import db
import os

class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    desc = db.Column(db.String(32), nullable=False, unique=True)
    starting_saldo = db.Column(db.Float, nullable=False, default=0)
    date_created = db.Column(db.DateTime, nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey('currency.id'), nullable=False)

    currency = db.relationship("Currency", backref="accounts")

    def changes(self, num=None, saldo_formatted=True):
        saldo = self.starting_saldo
        total = len(self.transactions) + len(self.in_transfers) + len(self.out_transfers)
        with open(os.path.join(os.path.dirname(__file__), 'changes.sql'), "r") as f:
            sql = f.read()

        changes = []
        for i, change in enumerate(db.session.execute(sql, {'id': self.id})):
            change = Change.from_dict(dict(change), self)
            if change.is_expense:
                saldo -= change.amount
            else:
                saldo += change.amount
            change.saldo(saldo)
            if num is None or total - i <= num:
                changes.append(change)
        saldo = self.currency.format(saldo) if saldo_formatted else round(saldo, self.currency.decimals)
        return saldo, changes[::-1]

    def saldo(self, formatted=True):
        return self.changes(num=0, saldo_formatted=formatted)[0]
    
    def starting(self):
        return self.currency.format(self.starting_saldo)