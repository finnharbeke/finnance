from app.main.groups import Change
from app import db
import os

class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    desc = db.Column(db.String(32), nullable=False, unique=True)
    starting_saldo = db.Column(db.Float, nullable=False, default=0)
    date_created = db.Column(db.DateTime, nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey('currency.id'), nullable=False)

    currency = db.relationship("Currency", backref="accounts")

    def api(self, deep=False):
        d = {
            "id": self.id,
            "desc": self.desc,
            "starting_saldo": self.starting_saldo,
            "date_created": self.date_created.strftime('%d.%m.%Y'),
            "currency": self.currency.api() if deep else self.currency.id,
            "saldo": self.saldo(formatted=False)
        }
        if deep:
            d["transactions"] = [tr.api() for tr in self.transactions]
            d["transfers_in"] = [tr.api() for tr in self.in_transfers]
            d["transfers_out"] = [tr.api() for tr in self.out_transfers]

        return d

    def changes(self, num=None, saldo_formatted=True):
        saldo = self.starting_saldo
        total = len(self.transactions) + len(self.in_transfers) + len(self.out_transfers)
        with open(os.path.join(os.path.dirname(__file__), '../static/sql/changes.sql'), "r") as f:
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