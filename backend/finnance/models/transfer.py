from sqlalchemy.sql.schema import CheckConstraint

from finnance import db


class AccountTransfer(db.Model, JSONModel):
    id = db.Column(db.Integer, primary_key=True)
    src_amount = db.Column(db.Integer, nullable=False)
    dst_amount = db.Column(db.Integer, nullable=False)
    src_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    dst_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    date_issued = db.Column(db.DateTime)
    comment = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship("User", backref="transfers")
    src = db.relationship(
        "Account", backref="out_transfers", foreign_keys=[src_id])
    dst = db.relationship(
        "Account", backref="in_transfers", foreign_keys=[dst_id])

    __table_args__ = (
        CheckConstraint('src_id != dst_id'),
    )

    json_relations = ["src", "dst"]

