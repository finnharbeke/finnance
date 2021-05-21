from app.main.account import Account
from flask import render_template, Blueprint, request, redirect, url_for, jsonify, send_file
import sqlalchemy
from app import db
from app.main.models import AccountTransfer, Flow, Transaction, Agent, Currency, Category
import datetime, io
import matplotlib.pyplot as plt
import seaborn as sns

mod_main = Blueprint('main', __name__)

def handle_transaction(request, account, edit=None):
    """Handles Post Method from trans_modal.j2
    
    If edit = None:
        - get all infos
        - if direct_flow create direct flow and set flow_id to it's id
        - else set category_id
    else:
        - edit is id of tr
        - get all infos
        1. Not direct_flow, wasn't either: Do Nothing
        2. Not direct_flow, was one: Delete Flow
        3. direct_flow, wasn't one: Create Flow
        4. direct_flow, was one: Edit Flow"""

    error_kwargs = dict(
        template_name_or_list="error.j2",
        title="Creation Failed!",
        link_text="Back",
        link=request.form.get("redirect"),
    )

    # AMOUNT
    amount = float(request.form.get("amount"))
    # IS_EXPENSE
    is_expense = request.form.get("expinc") == 'expense'
    # check saldo
    saldo = account.saldo(formatted=False)
    if edit is None:
        diff = amount if is_expense else -amount
    else:
        tr = Transaction.query.get(edit)
        diff = tr.amount if tr.is_expense else -tr.amount
        diff += -amount if is_expense else amount
    if is_expense and saldo + diff < 0:
        return render_template(
            desc="Transaction would result in negative Account Saldo!",
            **error_kwargs
        )
    # DATE_ISSUED
    date_issued = datetime.datetime.strptime(request.form.get("date_issued"), Transaction.input_format)
    if date_issued < account.date_created:
        return render_template(
            desc="Transaction can't have been executed before the creation of the account!",
            **error_kwargs
        )
    if date_issued > datetime.datetime.now():
        return render_template(
            desc="Transaction can't have been executed in the future!",
            **error_kwargs
        )
    # AGENT
    agent_desc = request.form.get("agent")
    agent = Agent.query.filter_by(desc=agent_desc).first()
    if not agent:
        agent = Agent(desc=agent_desc)
        db.session.add(agent)
        db.session.commit()
    # COMMENT
    comment = request.form.get("comment")
    # DIRECT_FLOW
    if request.form.get('directFlow') == "true":
        direct_flow_in = not is_expense
    else:
        direct_flow_in = None
    # CATEGORY_ID
    if direct_flow_in is not None:
        category_id = None
    elif is_expense:
        category_id = request.form.get("exp_category")
    else:
        category_id = request.form.get("inc_category")
    
    kwargs = dict(
        account_id=account.id, amount=amount, 
        agent_id=agent.id, date_issued=date_issued,
        category_id=category_id, comment=comment,
        is_expense=is_expense, direct_flow_in=direct_flow_in
    )
    flow_kwargs = dict(
        amount=amount,
        agent_id=agent.id
    )

    # DIRECT FLOW
    if edit is not None:
        tr = Transaction.query.get(edit)
        if direct_flow_in is None and tr.direct_flow_in:
            Flow.query.filter_by(trans_id=tr.id).delete()
        elif direct_flow_in is not None and not tr.direct_flow_in:
            db.session.add(Flow(trans_id=tr.id, **flow_kwargs))
        elif direct_flow_in is not None and tr.direct_flow_in:
            # edit direct flow
            flow = Flow.query.filter_by(trans_id=tr.id).first()
            for key, val in flow_kwargs.items():
                setattr(flow, key, val)
        
        # edit transaction
        for key, val in kwargs.items():
            setattr(tr, key, val)
        db.session.commit()

    else:
        tr = Transaction(**kwargs)
        db.session.add(tr)
        db.session.commit()

        if direct_flow_in is not None:
            db.session.add(Flow(trans_id=tr.id, **flow_kwargs))
            db.session.commit()

    if direct_flow_in is None:
        # other FLOWS
        if edit:
            # DELETE PREV FLOWS
            for flow in Flow.query.filter_by(trans_id=edit):
                db.session.delete(flow)

        n = int(request.form.get('flowCount'))
        if n > 0:
            for i in range(n):
                flow_agent_desc = request.form.get(f'flowAgent{i}')
                flow_amount = float(request.form.get(f'flowAmount{i}'))
                flow_agent = Agent.query.filter_by(desc=flow_agent_desc).first()
                if not flow_agent:
                    flow_agent = Agent(desc=flow_agent_desc) 
                    db.session.add(flow_agent)
                    db.session.commit()

                db.session.add(Flow(amount=flow_amount, agent_id=flow_agent.id, trans_id=tr.id))
        
        db.session.commit()

    return redirect(request.form.get("redirect"))

@mod_main.route("/transfers/add/<int:src_id>-<int:dst_id>/", methods=["POST"])
def add_transfer(src_id, dst_id):
    error_kwargs = dict(
        template_name_or_list="error.j2",
        title="Creation Failed!",
        link_text="Back",
        link=url_for('main.index'),
    )
    src = Account.query.get(src_id)
    dst = Account.query.get(dst_id)
    src_amount = float(request.form.get("src_amount"))
    saldo = src.saldo(formatted=False)
    if saldo - src_amount < 0:
        return render_template(
            desc="Transfer would result in negative Account Saldo!",
            **error_kwargs
        )
    dst_amount = float(request.form.get("dst_amount"))
    date_issued = datetime.datetime.strptime(request.form.get("date_issued"), Transaction.input_format)
    if date_issued < src.date_created or date_issued < dst.date_created:
        return render_template(
            desc="Transfer can't have been executed before the creation of an account!",
            **error_kwargs
        )
    if date_issued > datetime.datetime.now():
        return render_template(
            desc="Transfer can't have been executed in the future!",
            **error_kwargs
        )

    comment = request.form.get('comment')

    db.session.add(AccountTransfer(src_id=src_id, dst_id=dst_id, src_amount=src_amount, dst_amount=dst_amount, date_issued=date_issued, comment=comment))
    db.session.commit()
    return redirect(url_for('main.index'))

@mod_main.route("/accounts/<int:account_id>/transactions/add/", methods=["POST"])
def add_trans(account_id):
    account = Account.query.get(account_id)
    return handle_transaction(request, account)

@mod_main.route("/transactions/edit/<int:transaction_id>", methods=["POST"])
def edit_trans(transaction_id):
    tr = Transaction.query.get(transaction_id)
    return handle_transaction(request, tr.account, tr.id)

@mod_main.route("/", methods=["GET"])
def index():
    accounts = Account.query.all()
    agents = Agent.query.order_by(Agent.desc).all()
    categories = Category.query.order_by(Category.desc).all()
    return render_template("main/home.j2", accounts=accounts, agents=agents, categories=categories)

@mod_main.route("/accounts/<int:account_id>", methods=["GET", "POST"])
def account(account_id):
    account = Account.query.get(account_id)
    agents = Agent.query.order_by(Agent.desc).all()
    categories = Category.query.order_by(Category.desc).all()
    saldo, changes = account.changes(num=5)
    return render_template("main/account.j2", agents=agents, account=account, categories=categories, last_5=changes, saldo=saldo)

@mod_main.route("/add/account", methods=["GET", "POST"])
def add_account():
    currencies = Currency.query.all()
    if request.method == "GET":
        return render_template("main/add_acc.j2", currencies=currencies)
    else:
        desc = request.form.get("description")
        starting_saldo = float(request.form.get("starting_saldo"))
        date_created = datetime.datetime.strptime(request.form.get("date_created"), "%d.%m.%Y")
        if date_created > datetime.datetime.now():
            return render_template("error.j2", title="Creation Failed!", desc="Account can't have been created after today!", link=url_for('main.add_account'), link_text="Try again")
        currency_id = int(request.form.get("currency"))
        account = Account(desc=desc, starting_saldo=starting_saldo, date_created=date_created, currency_id=currency_id)
        db.session.add(account) # pylint: disable=no-member
        try:
            db.session.commit() # pylint: disable=no-member
        except sqlalchemy.exc.IntegrityError:
            return render_template("error.j2", title="Creation Failed!", desc="Account with same Description already exists!", link=url_for('main.add_account'), link_text="Try again")
        return redirect(url_for('main.add_account'))

@mod_main.route("/accounts/<int:account_id>/transactions")
def account_transactions(account_id):
    account = Account.query.get(account_id)
    agents = Agent.query.order_by(Agent.desc).all()
    categories = Category.query.order_by(Category.desc).all()
    
    saldo, changes = account.changes()
    
    return render_template("main/transactions.j2", account=account, saldo=saldo, transactions=changes, agents=agents, categories=categories)

@mod_main.route("/accounts/<int:account_id>/plot")
def account_plot(account_id):
    account = Account.query.get(account_id)

    saldo, changes = account.changes(saldo_formatted=False)
    changes = changes[::-1]

    # Set seaborn & matplotlib
    sns.set("notebook", font_scale=2)
    f, ax = plt.subplots(figsize=(24, 6))
    plt.tight_layout()
    # creation, transactions and now
    x = [account.date_created]*2 + [change.date_issued for change in changes] + [datetime.datetime.now()]
    y = [0, account.starting_saldo] + [change.saldo(formatted=False) for change in changes] + [saldo]

    plt.plot(x, y, drawstyle='steps-post', linewidth=2.5)
    ax.set_xlim(left=x[0], right=[x[-1]])

    bytes_image = io.BytesIO()
    plt.savefig(bytes_image, format='png')
    bytes_image.seek(0)
    plt.close()

    return send_file(bytes_image,
                     attachment_filename='plot.png',
                     mimetype='image/png')

@mod_main.route("/accounts/<int:account_id>/analysis")
def account_analysis(account_id):
    pass

@mod_main.route("/agents/<int:agent_id>")
def agent(agent_id):
    agent = Agent.query.get(agent_id)
    if not agent:
        return jsonify({"error": "Invalid agent_id!"}), 422
    account = Account.query.get(1)
    agents = Agent.query.order_by(Agent.desc).all()
    categories = Category.query.order_by(Category.desc).all()

    return render_template("main/agent.j2", agent=agent, account=account, categories=categories, agents=agents)

# CODE BELOW IS FOR FORCE RELOADING CSS
@mod_main.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    import os
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(mod_main.root_path, '..',
                                 endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)