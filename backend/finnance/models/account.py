from math import ceil

from sqlalchemy.sql.schema import UniqueConstraint

from finnance import db

from .json import JSONModel
from .transaction import Transaction
from .transfer import AccountTransfer


class Account(db.Model, JSONModel):
    id = db.Column(db.Integer, primary_key=True)

    desc = db.Column(db.String(32), nullable=False)
    starting_saldo = db.Column(db.Integer, nullable=False)
    date_created = db.Column(db.DateTime, nullable=False)
    currency_id = db.Column(db.Integer, db.ForeignKey(
        'currency.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    color = db.Column(db.String(7), nullable=False)
    order = db.Column(db.Integer, nullable=False)

    currency = db.relationship("Currency", backref="accounts")
    user = db.relationship("User", backref="accounts")

    __table_args__ = (
        UniqueConstraint('desc', 'user_id'),
        UniqueConstraint('order', 'user_id')
    )

    json_relations = ["currency"]

    def changes(self, num=None):
        saldos = [self.starting_saldo]
        changes = sorted(
            self.transactions + self.out_transfers + self.in_transfers,
            key=lambda ch: ch.date_issued
        )
        for change in changes:
            if type(change) is AccountTransfer:
                exp = change.src_id == self.id
                amount = change.src_amount if exp else change.dst_amount
            else:
                exp = change.is_expense
                amount = change.amount

            saldos.append(saldos[-1] + (amount if not exp else -amount))

        return changes[::-1] if num is None else changes[-num:][::-1], saldos[::-1]

    def jsonify_changes(self, pagesize, page, start=None, end=None, search: str = None, expenseCategory: list = None, incomeCategory: list = None):
        saldo = self.starting_saldo
        changes = sorted(
            self.transactions + self.out_transfers + self.in_transfers,
            key=lambda ch: ch.date_issued
        )
        filtered = []
        
        # Check if any category filter is active
        has_category_filter = (expenseCategory and len(expenseCategory) > 0) or (incomeCategory and len(incomeCategory) > 0)

        for i, change in enumerate(changes):
            if type(change) is AccountTransfer:
                exp = change.src_id == self.id
                amount = change.src_amount if exp else change.dst_amount
            else:
                exp = change.is_expense
                amount = change.amount

            saldo = saldo + (amount if not exp else -amount)

            if (start is not None and start > change.date_issued):
                continue
            if (end is not None and change.date_issued >= end):
                continue

            if type(change) is Transaction:
                desc = change.agent.desc
                # Filter by category if any category filter is provided
                if has_category_filter:
                    category_ids = expenseCategory if exp else incomeCategory
                    if not category_ids:
                        # If no matching category filter for this transaction type, skip it
                        continue
                    # Check if any record in this transaction matches the selected categories
                    if not any(record.category_id in category_ids for record in change.records):
                        continue
            else:
                # Skip transfers if any category filter is active
                if has_category_filter:
                    continue
                if change.src_id == self.id:
                    desc = change.dst.desc
                else:
                    desc = change.src.desc

            if (search is not None):
                inComment = search.lower() in change.comment.lower()
                inAgent = search.lower() in desc.lower()
                if not inComment and not inAgent:
                    continue

            filtered.append((saldo, desc, change))

        out = [{
            "type": "account_change",
            "acc_id": self.id,
            "saldo": saldo,
            "target": desc,
            "data": {
                **change.json(deep=False),
                "category_desc": change.records[0].category.desc if type(change) is Transaction and change.records else None
            }
        }
            for (saldo, desc, change) in filtered[::-1][pagesize*page:pagesize*(page+1)]
        ]

        return JSONModel.obj_to_api({
            "pages": ceil(len(filtered) / pagesize),
            "changes": out
        })

    @property
    def saldo(self):
        return self.changes(num=1)[1][0]

    def starting(self):
        return self.currency.format(self.starting_saldo)

