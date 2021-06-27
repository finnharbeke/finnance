from  app.main.models import Transaction, Category, Record, Agent
from flask import jsonify, Blueprint
import sqlalchemy, datetime as dt, seaborn as sns
from .controllers import anal

api = Blueprint('anal_api', __name__, url_prefix=anal.url_prefix+'/api',
    static_folder='static')

@api.route("/<int:year>/<int:month>")
def stairs(year, month):
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

@api.route("/sunburst")
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

@api.route("/sunburst_agents")
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
