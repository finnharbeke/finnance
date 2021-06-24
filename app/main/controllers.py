from app.main.account import Account
from flask import render_template, Blueprint, request, redirect, url_for, jsonify, send_file
import sqlalchemy
from app import db
from app.main.models import Transaction, Agent, Currency, Category, Record
import datetime as dt, io
import matplotlib.pyplot as plt
import seaborn as sns

mod_main = Blueprint('main', __name__)

def modal_params():
    return dict(
        accounts=Account.query.all(),
        agents=Agent.query.order_by(Agent.desc).all(),
        categories=Category.query.order_by(Category.desc).all(),
        currencies=Currency.query.all()
    )

@mod_main.route("/", methods=["GET"])
def index():
    return render_template("main/home.j2", **modal_params())

@mod_main.route("/accounts/<int:account_id>", methods=["GET", "POST"])
def account(account_id):
    account = Account.query.get(account_id)
    saldo, changes = account.changes(num=5)
    return render_template("main/account.j2", account=account,
        last_5=changes, saldo=saldo, **modal_params())

@mod_main.route("/add/account", methods=["GET", "POST"])
def add_account():
    currencies = Currency.query.all()
    if request.method == "GET":
        return render_template("main/add_acc.j2", currencies=currencies)
    else:
        desc = request.form.get("description")
        starting_saldo = float(request.form.get("starting_saldo"))
        date_created = dt.datetime.strptime(
            request.form.get("date_created"), "%d.%m.%Y"
        )
        if date_created > dt.datetime.now():
            return render_template("error.j2", 
                title="Creation Failed!",
                desc="Account can't have been created after today!",
                link=url_for('main.add_account'), link_text="Try again"
            )
        currency_id = int(request.form.get("currency"))
        account = Account(desc=desc, starting_saldo=starting_saldo, date_created=date_created, currency_id=currency_id)
        db.session.add(account) # pylint: disable=no-member
        try:
            db.session.commit() # pylint: disable=no-member
        except sqlalchemy.exc.IntegrityError:
            return render_template("error.j2", title="Creation Failed!", 
                desc="Account with same Description already exists!",
                link=url_for('main.add_account'), link_text="Try again"
            )
        return redirect(url_for('main.add_account'))

@mod_main.route("/accounts/<int:account_id>/transactions")
def account_transactions(account_id):
    account = Account.query.get(account_id)
    saldo, changes = account.changes()
    
    return render_template("main/transactions.j2", account=account,
        saldo=saldo, changes=changes, **modal_params())

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
    x = [account.date_created]*2 + [change.date_issued for change in changes] + [dt.datetime.now()]
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

@mod_main.route("/d3/<int:year>/<int:month>")
def d3(year, month):
    try:
        dt.datetime(year=year, month=month, day=1)
    except Exception as e:
        print(e)
        return render_template("error.j2", title="Invalid Year & Month!", desc="", link=url_for('main.index'), link_text="Go to Home")
    return render_template("main/d3.j2", year=year, month=month)

@mod_main.route("/api/d3/<int:year>/<int:month>")
def d3_data(year, month):
    records = Record.query.join(Transaction).filter(
        Transaction.currency_id == 1
    ).filter(
        Transaction.date_issued.between(dt.datetime(year, month, 1), dt.datetime(year + (month == 12), (month + 1) % 12 + 12*(month == 11), 1))
    ).order_by(
        Transaction.date_issued
    )
    data = []
    saldo = 0
    day = dt.datetime(year, month, 1)
    ix = 0
    in_dict = {cat.id: i for i, cat in enumerate(Category.query.filter_by(is_expense=False))}
    out_dict = {cat.id: i for i, cat in enumerate(Category.query.filter_by(is_expense=True))}
    in_cmap = sns.color_palette("viridis", n_colors=len(in_dict)).as_hex()
    out_cmap = sns.color_palette("rocket", n_colors=len(out_dict)).as_hex()
    while day < dt.datetime(2021, 6, 1):
        while ix < records.count() and records[ix].trans.date_issued < day:
            ix += 1
        nothing = True
        while ix < records.count() and day <= records[ix].trans.date_issued < day + dt.timedelta(days=1):
            nothing = False
            rec = records[ix]
            if rec.trans.is_expense:
                top = saldo
                saldo -= rec.amount
                base = saldo
            else:
                base = saldo
                saldo += rec.amount
                top = saldo
            data.append({
                'base': base, 'top': top,
                'name': day.strftime('%d'),
                'color': out_cmap[out_dict[rec.category_id]] if rec.trans.is_expense else in_cmap[in_dict[rec.category_id]]
            })
            ix += 1
        if nothing:
            data.append({
                'base': 0, 'top': 0, 'name': day.strftime('%d'), 'color': "#000000"
            })
        day += dt.timedelta(days=1)

    return jsonify(data)

@mod_main.route("/api/sunburst")
def sunburst():
    categories = Category.query.filter_by(
        is_expense=True
    )

    help_ = lambda c: Record.query.filter_by(category_id=c.id).join(Transaction).filter(
        Transaction.currency_id == 1
    ).with_entities(
        sqlalchemy.func.sum(Record.amount).label('sum')
    ).first().sum

    sum_cat = lambda c: help_(c) if help_(c) is not None else 0

    data = []
    for cat in categories:
        if cat.parent is not None:
            continue
        if len(cat.children) != 0:
            ch = []
            ch.append({'name': cat.desc, 'value': sum_cat(cat)})
            for c in cat.children:
                ch.append({'name': c.desc, 'value': sum_cat(c)})
            data.append({
                'name': cat.desc,
                'children': ch
            })
        else:
            data.append({
                'name': cat.desc,
                'value': sum_cat(cat)
            })
    return jsonify({'name': 'exp', 'children': data})

@mod_main.route("/api/sunburst_agents")
def sunburst_agents():
    categories = Category.query.filter_by(
        is_expense=True
    )

    help_ = lambda c, ag: Record.query.filter_by(
        category_id=c.id
    ).join(Transaction).join(Agent).filter(
        Transaction.currency_id == 3
    ).filter(
        Agent.id == ag.id
    ).with_entities(
        sqlalchemy.func.sum(Record.amount).label('sum')
    ).first().sum

    sum_cat_ag = lambda c, ag: help_(c, ag) if help_(c, ag) is not None else 0

    def agents(cat):
        d = []
        for ag in Agent.query.join(Transaction).join(Record).filter(Record.category_id == cat.id):
            # d.append({'name': ag.desc, 'value': sum_cat_ag(cat, ag)})
            d.append({'name': ag.desc, 'children': [
                {
                    'name': rec.trans.date_issued.strftime('%d.%m.%y %H:%M'),
                    'value': rec.amount
                }
                for rec in  Record.query.filter_by(
                                category_id=cat.id
                            ).join(Transaction).join(Agent).filter(
                                Transaction.currency_id == 1
                            ).filter(
                                Agent.id == ag.id
                            )
            ]})

        return d

    data = []
    for cat in categories:
        if cat.parent is not None:
            continue
        if len(cat.children) != 0:
            ch = []
            ch.append({'name': cat.desc, 'children': agents(cat)})
            for c in cat.children:
                ch.append({'name': c.desc, 'children': agents(c)})
            data.append({
                'name': cat.desc,
                'children': ch
            })
        else:
            data.append({
                'name': cat.desc,
                'children': agents(cat)
            })
    return jsonify({'name': 'exp', 'children': data})

@mod_main.route("/agents/<int:agent_id>")
def agent(agent_id):
    agent = Agent.query.get(agent_id)
    if not agent:
        return jsonify({"error": "Invalid agent_id!"}), 422

    return render_template("main/agent.j2", agent=agent, **modal_params())

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