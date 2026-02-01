from sqlalchemy.sql.schema import UniqueConstraint

from finnance import db

from .json import JSONModel


class Category(db.Model, JSONModel):
    id = db.Column(db.Integer, primary_key=True)
    desc = db.Column(db.String(64), nullable=False)
    is_expense = db.Column(db.Boolean, nullable=False)
    usable = db.Column(db.Boolean, nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    color = db.Column(db.String(7), nullable=False)
    order = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship("User", backref="categories")

    # parent = db.relationship("Category", remote_side=[id])

    @property
    def parent(self):
        return Category.query.filter_by(id=self.parent_id, user_id=self.user_id).first()

    __table_args__ = (
        UniqueConstraint('user_id', 'desc', 'is_expense'),
        UniqueConstraint('user_id', 'order', 'is_expense')
    )

    json_relations = ["records"]
