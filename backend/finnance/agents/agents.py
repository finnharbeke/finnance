from http import HTTPStatus
from flask import Blueprint
from flask_login import current_user, login_required

from finnance import db
from finnance.models import Agent, JSONModel
from finnance.errors import APIError

agents = Blueprint('agents', __name__, url_prefix='/api/agents')

@agents.route("")
@login_required
def all_agents():
    agents = Agent.query.filter_by(user_id=current_user.id).order_by(Agent.desc).all()
    return JSONModel.obj_to_api([agent.json(deep=False) for agent in agents])

@agents.route("/<int:agent_id>")
@login_required
def agent(agent_id):
    agent = Agent.query.filter_by(user_id=current_user.id, id=agent_id).order_by(Agent.desc).first()
    if agent is None:
        raise APIError(HTTPStatus.NOT_FOUND)
    return agent.api()

def create_agent_ifnx(agent_desc):
    if agent_desc is None:
        return None
    agent = Agent.query.filter_by(desc=agent_desc).first()
    if not agent:
        agent = Agent(desc=agent_desc, user_id=current_user.id)
        db.session.add(agent)
    return agent