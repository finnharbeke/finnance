import sqlalchemy
from flask import Blueprint
from flask_login import current_user, login_required

from finnance.models import Agent, Flow, JSONModel, Transaction

agents = Blueprint('agents', __name__, url_prefix='/api/agents')

@agents.route("")
@login_required
def all_agents():
    agents = Agent.query.filter_by(user_id=current_user.id).join(Transaction, isouter=True).join(
        Flow, sqlalchemy.and_(Agent.id == Flow.agent_id, 
        Transaction.id == Flow.trans_id), isouter=True).group_by(
            Agent.id).order_by(Agent.uses.desc(), Agent.desc).all()
    return JSONModel.obj_to_api([agent.json(deep=True) for agent in agents])