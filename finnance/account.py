import sqlalchemy
from finnance.models import AccountTransfer, Transaction
from finnance import db
import os

class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    desc = db.Column(db.String(32), nullable=False, unique=True)
    starting_saldo = db.Column(db.Float, nullable=False, default=0)
    date_created = db.Column(db.DateTime, nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey('currency.id'), nullable=False)

    currency = db.relationship("Currency", backref="accounts")

    def changes(self, num=None):
        saldo = self.starting_saldo
        total = len(self.transactions) + len(self.in_transfers) + len(self.out_transfers)

        changes = sorted(
            self.transactions + self.out_transfers + self.in_transfers,
            key=lambda ch: ch.date_issued
        )
        
        saldos = []
        for i, change in enumerate(changes):
            if type(change) is AccountTransfer:
                exp = change.src_id == self.id
                amount = change.src_amount if exp else change.dst_amount
            else:
                exp = change.is_expense
                amount = change.amount
            if exp:
                saldo -= amount
            else:
                saldo += amount
            saldos.append(round(saldo, self.currency.decimals))
        
        return changes[::-1] if num is None else changes[-num:][::-1], saldos[::-1]

    def saldo(self):
        return self.changes()[1][0]
    
    def starting(self):
        return self.currency.format(self.starting_saldo)