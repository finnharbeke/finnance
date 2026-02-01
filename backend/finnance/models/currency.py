from sqlalchemy.sql.schema import CheckConstraint, UniqueConstraint

from finnance import db


class Currency(db.Model, JSONModel):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(3), nullable=False)
    decimals = db.Column(db.Integer, CheckConstraint(
        "decimals >= 0"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship("User", backref="currencies")
    __table_args__ = (
        UniqueConstraint('code', 'user_id'),
    )

    json_relations = ["accounts"]

    def format(self, number: int) -> str:
        return "{n:,.{d}f}".format(n=number / (10 ** self.decimals), d=self.decimals)

