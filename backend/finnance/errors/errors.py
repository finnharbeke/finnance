from http import HTTPStatus
import json
from flask import request

from jsonschema import Draft202012Validator, ValidationError


class APIError(Exception):
    def __init__(self, status: HTTPStatus, msg=None):
        self.status = status
        self.msg = status.description if msg is None else msg

def validate(schema):
    class Wrapper:
        def __init__(self, foo, schema):
            self.foo = foo
            self.__name__ = foo.__name__
            self.schema = schema
            self.validator = Draft202012Validator(schema=schema)

        def __call__(self, **kwargs):
            try:
                data = json.loads(request.data.decode())
                self.validator.validate(instance=data)
            except json.decoder.JSONDecodeError:
                raise APIError(HTTPStatus.BAD_REQUEST, "Non-JSON format")
            except ValidationError as err:
                raise APIError(HTTPStatus.BAD_REQUEST,
                               f"Invalid JSON schema: {err.message}")
            return self.foo(**data, **kwargs)

    return lambda foo: Wrapper(foo, schema)