from app.main.account import Account
from app.main.models import Category, Currency, Flow, RemoteFlow, Transaction, AccountTransfer, Agent
from flask import jsonify, Blueprint

mod_api = Blueprint('api', __name__)

@mod_api.route("/api/transactions/<int:transaction_id>")
def api_transaction(transaction_id):
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({"error": "Invalid transaction_id!"}), 422

    return jsonify(transaction.api(deep=True))

@mod_api.route("/api/transfers/<int:transfer_id>")
def api_transfer(transfer_id):
    transfer = AccountTransfer.query.get(transfer_id)
    if not transfer:
        return jsonify({"error": "Invalid transfer_id!"}), 422

    return jsonify(transfer.api(deep=True))

@mod_api.route("/api/accounts/<int:account_id>")
def api_account(account_id):
    account = Account.query.get(account_id)
    if not account:
        return jsonify({"error": "Invalid account_id!"}), 422

    return jsonify(account.api(deep=True))

@mod_api.route("/api/agents/<int:agent_id>")
def api_agent(agent_id):
    agent = Agent.query.get(agent_id)
    if not agent:
        return jsonify({"error": "Invalid agent_id!"}), 422

    return jsonify(agent.api(deep=True))

@mod_api.route("/api/categories/<int:category_id>")
def api_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "Invalid category_id!"}), 422

    return jsonify(category.api(deep=True))

@mod_api.route("/api/currencies/<int:currency_id>")
def api_currency(currency_id):
    currency = Currency.query.get(currency_id)
    if not currency:
        return jsonify({"error": "Invalid currency_id!"}), 422

    return jsonify(currency.api(deep=True))

@mod_api.route("/api/flows/<int:flow_id>")
def api_flow(flow_id):
    flow = Flow.query.get(flow_id)
    if not flow:
        return jsonify({"error": "Invalid flow_id!"}), 422

    return jsonify(flow.api(deep=True))

@mod_api.route("/api/remotes/<int:remote_id>")
def api_remoteflow(remote_id):
    remote = RemoteFlow.query.get(remote_id)
    if not remote:
        return jsonify({"error": "Invalid remote_flow_id!"}), 422

    return jsonify(remote.api(deep=True))
