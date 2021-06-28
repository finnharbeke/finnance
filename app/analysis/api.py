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

    data = []
    exp = set()
    inc = set()
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
                Category.desc.label('category'),
                Category.is_expense
            ):
            data.append(dict(month=start.strftime('%B %y'), **row._asdict()))
            if row._asdict()['is_expense']:
                exp.add(row._asdict()['category'])
            else:
                inc.add(row._asdict()['category'])
    print(exp, inc)
    for cat in exp:
        if cat in inc:
            for entry in data:
                if entry['category'] == cat and not entry['is_expense']:
                    entry['category'] += ' +'


    return jsonify(data)

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