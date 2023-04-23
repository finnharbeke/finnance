from http import HTTPStatus
import sqlalchemy
from flask import Blueprint
from flask_login import current_user, login_required

from finnance.models import Agent, Flow, JSONModel, Transaction
from finnance.errors import APIError

agents = Blueprint('agents', __name__, url_prefix='/api/agents')

@agents.route("")
@login_required
def all_agents():
    agents = Agent.query.filter_by(user_id=current_user.id).order_by(Agent.desc).all()
    return JSONModel.obj_to_api([agent.json(deep=True) for agent in agents])

@agents.route("/<int:agent_id>")
@login_required
def agent(agent_id):
    agent = Agent.query.filter_by(user_id=current_user.id, id=agent_id).order_by(Agent.desc).first()
    if agent is None:
        return APIError(HTTPStatus.NOT_FOUND, "agent_id not found")
    return JSONModel.obj_to_api([agent.json(deep=True) for agent in agents])