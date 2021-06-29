from  app.main.models import Transaction, Category, Record, Agent, Currency
from  app.main.account import Account
from flask import jsonify, Blueprint
import sqlalchemy, datetime as dt
from .controllers import anal

api = Blueprint('anal_api', __name__, url_prefix=anal.url_prefix+'/api',
    static_folder='static')

@api.route("/<int:year>/<int:month>")
def stairs(year, month):
    day = dt.datetime(year, month, 1)
    end = dt.datetime(year + (month == 12), 1 if month == 12 else month + 1, 1)
    records = Record.query.join(Transaction).filter(
        Transaction.currency_id == 1
    ).filter(sqlalchemy.and_(
        day <= Transaction.date_issued,
        Transaction.date_issued < end
    )).order_by(
        Transaction.date_issued
    )
    data = []
    days = []
    saldo = 0
    ix = 0
    while day < end:
        days.append(day.isoformat())
        while ix < records.count() and records[ix].trans.date_issued < day:
            ix += 1
        while ix < records.count() and day <= records[ix].trans.date_issued < day + dt.timedelta(days=1):
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
                'day': day.isoformat(),
                'color': rec.category.color,
                'id': rec.category.id
            })
            ix += 1
        day += dt.timedelta(days=1)

    return jsonify({'entries': data, 'days': days})

@api.route("/sunburst/income/<int:curr_id>")
def sunburst_income(curr_id):
    return sunburst_expenses(curr_id, is_expense=False)
@api.route("/sunburst/expenses/<int:curr_id>")
def sunburst_expenses(curr_id, is_expense=True):
    currency = Currency.query.get(curr_id)
    if currency is None:
        return "invalid id", 404
    categories = Category.query.filter_by(
        is_expense=is_expense
    )

    def agents(cat):
        return [
            dict(
                color=cat.color,
                id=cat.id,
                **row._asdict()
            )
        for row in Agent.query.join(Transaction).join(Record).filter(
                Record.category_id == cat.id
            ).filter(
                Transaction.currency_id == currency.id
            ).with_entities(sqlalchemy.func.sum(Record.amount).label('value'), Agent.desc.label('name'))
        ]

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
            'order': cat.order,
            'id': cat.id
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

@api.route("/divstackbars/<int:curr_id>")
def divstackbars(curr_id):
    currency = Currency.query.get(curr_id)
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
        data.append(dict(
            month=start.strftime('%B %y'),
            category=list(desc_dict.values())[0],
            value=0,
            is_expense=True,
            id=0
        ))
        for row in Record.query.join(Category).join(Transaction).join(Currency).filter(
                sqlalchemy.and_(
                    start <= Transaction.date_issued,
                    Transaction.date_issued < dates[i+1],
                    Transaction.currency_id == currency.id
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
 

    # reverse expenses so that order is correct in the negative part
    cats = [
        cat for cat in Category.query.filter_by(is_expense=False).order_by(Category.order.asc())
    ] + [
        cat for cat in Category.query.filter_by(is_expense=True).order_by(Category.order.desc())
    ]
    return jsonify({
        'categories': data,
        'positives': [desc_dict[cat.id] for cat in filter(lambda cat: not cat.is_expense, cats)],
        'negatives': [desc_dict[cat.id] for cat in filter(lambda cat: cat.is_expense, cats)],
        'colors': [cat.color for cat in cats],
        'keys': [desc_dict[cat.id] for cat in cats],
        'key_to_id': {desc_dict[cat.id]: cat.id for cat in cats}
    })

@api.route("/12incexp/<int:curr_id>")
def inc_vs_exp(curr_id):
    currency = Currency.query.get(curr_id)
    if currency is None:
        return "invalid id", 404
    dates = months_dates()
    i = 0
    inc = [0] * 12
    exp = [0] * 12

    for record in Record.query.join(Transaction).join(Category).filter(
        sqlalchemy.and_(dates[0] <= Transaction.date_issued,
            Transaction.date_issued < dates[-1]),
            Transaction.currency_id == currency.id
        ).order_by(Transaction.date_issued):
        while record.trans.date_issued >= dates[i+1]:
            i += 1
        if record.category.is_expense:
            exp[i] += record.amount
        else:
            inc[i] += record.amount
    
    for i in range(12):
        inc[i] = round(inc[i], 2)
        exp[i] = round(exp[i], 2)

    return jsonify({
        'ys': [inc, exp],
        'x': [d.isoformat() for d in dates[:-1]],
        'curr_code': currency.code,
        'x_label': 'Income / Expenses',
        'y_label': 'Months',
        'colors': ["#7ac56d", "#bf5164"],
        'labels': ["Income", "Expenses"]
    })

@api.route('account/<int:acc_id>')
def account(acc_id):
    account = Account.query.get(acc_id)

    saldo, changes = account.changes(saldo_formatted=False)
    changes = changes[::-1]

    x = [account.date_created] + [change.date_issued for change in changes] + [dt.datetime.now()]
    y = [account.starting_saldo] + [change.saldo(formatted=False) for change in changes] + [saldo]

    return jsonify({
        'ys': [y],
        'x': [d.isoformat() for d in x],
        'curr_code': account.currency.code,
        'x_label': 'Time',
        'y_label': 'Saldo',
        'colors': ["#000000"],
        'labels': ["Saldo"]
    })