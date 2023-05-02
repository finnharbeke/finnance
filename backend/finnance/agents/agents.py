from http import HTTPStatus

import sqlalchemy
from finnance.errors import APIError
from finnance.models import Agent, Flow, JSONModel, Transaction
from flask import Blueprint
from flask_login import current_user, login_required

from finnance import db

agents = Blueprint('agents', __name__, url_prefix='/api/agents')

@agents.route("")
@login_required
def all_agents():
    agents = Agent.query.filter_by(user_id=current_user.id).join(Transaction, isouter=True).join(
        Flow, sqlalchemy.and_(Agent.id == Flow.agent_id, 
        Transaction.id == Flow.trans_id), isouter=True).group_by(
            Agent.id).order_by(Agent.uses.desc(), Agent.desc)
    return JSONModel.obj_to_api([agent.desc for agent in agents])

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
    agent = Agent.query.filter_by(desc=agent_desc, user_id=current_user.id).first()
    if not agent:
        agent = Agent(desc=agent_desc, user_id=current_user.id)
        db.session.add(agent)
        db.session.commit()
    return agent