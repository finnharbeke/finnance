from datetime import datetime
from http import HTTPStatus

from finnance.errors import APIError

class ModelID:
    def __init__(self, id_param):
        if id_param == 'null':
            self.id = None
        else:
            self.id = int(id_param)

def parseSearchParams(params: dict[str, str], template: dict[str, type]):
    template.update(pagesize=int, page=int)
    parsed = dict(pagesize=10, page=0)
    for key, val in params.items():
        if key in template and val != '':
            try:
                if template[key] == datetime:
                    parsed[key] = datetime.fromisoformat(val)
                else:
                    parsed[key] = template[key](val)
            except ValueError:
                raise APIError(HTTPStatus.BAD_REQUEST, f'invalid search param {key}')
    return parsed