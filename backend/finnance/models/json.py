import datetime as dt
import json

import sqlalchemy
from flask import current_app

from finnance import db


class JSONModel:
    json_relations = []
    json_ignore = []

    @staticmethod
    def default(obj):
        if isinstance(obj, dt.datetime):
            return obj.isoformat()
        else:
            return str(obj)

    def api(self):
        return self.obj_to_api(self.json(deep=True))

    @staticmethod
    def obj_to_api(obj):
        return current_app.response_class(
            f"{json.dumps(obj, default=JSONModel.default)}\n",
            mimetype=current_app.json.mimetype,
        )

    @staticmethod
    def jsonValue(obj):
        if isinstance(obj, db.Model):
            return obj.json(deep=False)
        if isinstance(obj, sqlalchemy.orm.collections.InstrumentedList
                      ) or isinstance(obj, list):
            return [item.json(deep=False) for item in obj]
        return obj

    def json(self, deep: bool):
        d = {
            key: self.jsonValue(value)
            for key, value in self.__dict__.items()
            if not (key.startswith('_') or key in self.json_ignore
                    or isinstance(value, db.Model) or isinstance(value, sqlalchemy.orm.collections.InstrumentedList))
        }
        # properties
        d.update({
            key: self.jsonValue(getattr(self, key))
            for key in vars(type(self))
            if isinstance(getattr(type(self), key), property)
        })
        d["type"] = type(self).__name__.lower()
        if deep:
            d.update({
                key: self.jsonValue(getattr(self, key))
                for key in self.json_relations
            })
        return d
