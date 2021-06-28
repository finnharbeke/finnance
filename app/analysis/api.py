from  app.main.models import Transaction, Category, Record, Agent, Currency
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
                'color': rec.category.color
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
            d.append({'name': ag.desc, 'color': cat.color, 'children': [
                {
                    'name': rec.trans.date_issued.strftime('%d.%m.%y %H:%M'),
                    'color': cat.color,
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

    def cat_obj(cat: Category, inside=False):
        if len(cat.children) == 0 or inside:
            children = agents(cat)
        else:
            children = [
                cat_obj(ch) for ch in cat.children
            ] + [cat_obj(cat, inside=True)]
        return {
            'name': cat.desc,
            'color': cat.color,
            'children': children,
            'order': cat.order
        }

    data = []
    for cat in categories:
        if cat.parent is not None:
            continue
        data.append(cat_obj(cat))
    return jsonify({'name': 'exp', 'children': data})

def months_dates():
    now = dt.datetime.now()
    start_of_month = dt.datetime(year=now.year, month=now.month, day=1)
    dates = [start_of_month, now]
    for _ in range(11):
        dates.insert(0, dt.datetime(
            year = dates[0].year - int(dates[0].month == 1),
            month = dates[0].month - 1 if dates[0].month != 1 else 12,
            day = 1
        ))
    return dates

@api.route("/divstackbars")
def divstackbars():
    dates = months_dates()
    
    exp = set()
    desc_dict = {}
    for cat in Category.query.order_by(Category.is_expense.desc()):
        desc_dict[cat.id] = cat.desc
        if cat.is_expense:
            exp.add(cat.desc)
        elif cat.desc in exp:
            desc_dict[cat.id] += ' +'

    data = []
    for i, start in enumerate(dates[:-1]):
        for row in Record.query.join(Category).join(Transaction).join(Currency).filter(
                sqlalchemy.and_(
                    start <= Transaction.date_issued,
                    Transaction.date_issued < dates[i+1]
                )
            ).group_by(Category.id).with_entities(
                sqlalchemy.func.round(
                    sqlalchemy.func.sum(Record.amount),
                    Currency.decimals
                ).label('value'),
                Category.id,
                Category.is_expense
            ):
            data.append(dict(
                month=start.strftime('%B %y'),
                category=desc_dict[row._asdict()['id']], 
                **row._asdict()
            ))


    return jsonify({
        'categories': data,
        'positives': [desc_dict[cat.id] for cat in Category.query.filter_by(is_expense=False).order_by(Category.order)],
        'negatives': [desc_dict[cat.id] for cat in Category.query.filter_by(is_expense=True).order_by(Category.order)],
        'colors': [cat.color for cat in Category.query.order_by(Category.order)],
        'keys': [desc_dict[cat.id] for cat in Category.query.order_by(Category.order)]
    })

@api.route("/12incexp")
def inc_vs_exp():
    dates = months_dates()
    i = 0
    inc = [0] * 12
    exp = [0] * 12

    for record in Record.query.join(Transaction).join(Category).filter(
        Transaction.date_issued >= dates[0]).order_by(Transaction.date_issued):
        while record.trans.date_issued >= dates[i+1]:
            i += 1
        if record.category.is_expense:
            exp[i] += record.amount
        else:
            inc[i] += record.amount

    return jsonify({
        'inc': inc,
        'exp': exp,
        'months': [d.isoformat() for d in dates[:-1]]
    })