from finnance.models import Transaction, Category, Record, Agent, Currency, Account, AccountTransfer, Flow
from flask import jsonify, Blueprint, request, abort
from flask_login import login_required, current_user
import sqlalchemy, datetime as dt

from finnance.queries import account_filter, category_filter, record_filter, flow_filter, transfer_filter, trans_filter, clear_argsdict
from .controllers import anal
from finnance.main.controllers import dated_url_for

api = Blueprint('anal_api', __name__, url_prefix=anal.url_prefix+'/api',
    static_folder='static', static_url_path='/static/analysis/api')

@api.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

@api.route("/stairs")
@login_required
def stairs():
    req = clear_argsdict(request.args.to_dict())
    records = record_filter(**req)
    day = dt.datetime.fromisoformat(req['start'])
    end = dt.datetime.fromisoformat(req['end'])
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

@api.route("/sunburst")
@login_required
def sunburst():
    req = clear_argsdict(request.args.to_dict())
    def agents(cat):
        myreq = req.copy()
        myreq.update({'category_id': cat.id})
        return [
            dict(
                color=cat.color,
                id=cat.id,
                **row._asdict()
            )
        for row in record_filter(**myreq,
                query=Agent.query.join(Transaction).join(Record).join(Category)
            ).group_by(Agent).with_entities(
                sqlalchemy.func.sum(Record.amount).label('value'), 
                Agent.desc.label('name')
            )
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
    for cat in category_filter(parent_id=None):
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
@login_required
def divstackbars(curr_id):
    currency = Currency.query.get(curr_id)
    dates = months_dates()
    
    exp = set()
    desc_dict = {}
    for cat in category_filter():
        desc_dict[cat.id] = cat.desc
        if cat.is_expense:
            exp.add(cat.desc)
        elif cat.desc in exp:
            desc_dict[cat.id] += ' +'

    data = []
    for i, start in enumerate(dates[:-1]):
        query = record_filter(start=start, end=dates[i+1], currency_id=currency.id)
        query = query.group_by(Category.id).with_entities(
            sqlalchemy.func.round(
                sqlalchemy.func.sum(Record.amount),
                Currency.decimals
            ).label('value'),
            Category.id,
            Category.is_expense
        )
        zero = True
        for row in query:
            zero = False
            data.append(dict(
                month=start.strftime('%B %y'),
                category=desc_dict[row._asdict()['id']], 
                **row._asdict()
            ))
        if zero:
            data.append(dict(
                month=start.strftime('%B %y'),
                category=list(desc_dict.values())[0],
                value=0,
                is_expense=True,
                id=list(desc_dict.keys())[0]
            ))
 

    # reverse expenses so that order is correct in the negative part
    cats = category_filter(is_expense=False).order_by(Category.order.asc()).all() + (
           category_filter(is_expense=True).all())
    return jsonify({
        'categories': data,
        'positives': [desc_dict[cat.id] for cat in filter(lambda cat: not cat.is_expense, cats)],
        'negatives': [desc_dict[cat.id] for cat in filter(lambda cat: cat.is_expense, cats)],
        'colors': [cat.color for cat in cats],
        'keys': [desc_dict[cat.id] for cat in cats],
        'key_to_id': {desc_dict[cat.id]: cat.id for cat in cats}
    })

def plot_dict(x, y, label, color):
    return {
        'label': label,
        'color': color,
        'xy': [{'x': t[0], 'y': t[1]} for t in zip(x, y)]
    }

@api.route("/12incexp/<int:curr_id>")
@login_required
def inc_vs_exp(curr_id):
    currency = Currency.query.get(curr_id)
    if currency is None:
        return "invalid id", 404
    dates = months_dates()
    i = 0
    inc = [0] * 12
    exp = [0] * 12

    for record in record_filter(start=dates[0], end=dates[-1], currency_id=currency.id):
        while record.trans.date_issued >= dates[i+1]:
            i += 1
        if record.category.is_expense:
            exp[i] += record.amount
        else:
            inc[i] += record.amount
    
    for i in range(12):
        inc[i] = round(inc[i], 2)
        exp[i] = round(exp[i], 2)

    dates = [d.isoformat() for d in dates[:-1]]

    return jsonify({
        'plots': [
            plot_dict(dates, inc, "Income", "#7ac74f"),
            plot_dict(dates, exp, "Expenses", "#ff3e41")
        ],
        'curr_code': currency.code,
        'x_label': 'Income / Expenses',
        'y_label': 'Months',
    })

def acc_plot(acc, color=None, label=None):
    changes, saldos = acc.changes()
    changes = changes[::-1]
    saldos = saldos[::-1]

    x = [acc.date_created] * 2 + (
        [change.date_issued for change in changes] + 
        [dt.datetime.now()])
    x = [d.isoformat() for d in x]
    y = [0, saldos[0]] + saldos[1:] + [saldos[-1]]

    return plot_dict(x, y, 
        acc.desc if label is None else label,
        acc.color if color is None else color
    )

@api.route('account/<int:acc_id>')
@login_required
def account(acc_id):
    account = Account.query.get(acc_id)
    if account.user_id != current_user.id:
        abort(404)
    return jsonify({
        'plots': [acc_plot(account, label='Saldo')],
        'curr_code': account.currency.code,
        'x_label': 'Time',
        'y_label': 'Saldo',
    })

@api.route('net')
@api.route('net/<int:currency_id>')
@login_required
def net(currency_id=1):
    currency = Currency.query.get(currency_id)

    transes = trans_filter(currency_id=currency.id, remote=False).all()
    transfers = transfer_filter().all()
    
    accounts = account_filter(currency_id=currency_id).all()
    flows = flow_filter(currency_id=currency_id).all()
    n = len(accounts)
    accs = {a.id: {'label': a.desc, 'color': a.color, 'xy': []} for a in accounts}
    acc_i = 0
    trf_i = 0
    saldos = {a.id: 0 for a in accounts}
    ix = {a.id: i for i, a in enumerate(accounts)}
    id_ = {i: a.id for i, a in enumerate(accounts)}
    started = {a.id: False for a in accounts}
    def xy(what, dt, y):
        d = {'x': dt.isoformat(), 'y': y}
        if what == "f":
            fp.append(d)
        else:
            assert what in ix
            accs[what]['xy'].append(d)
    f_i = 0
    f = 0
    fp = []
    # None is used as the last closure, for new accounts and transfers after the last trans
    for t in transes + [None]:
        for acc_i, acc in enumerate(accounts):
            if started[acc.id] or (t is not None and acc.date_created > t.date_issued):
                continue
            saldos[acc.id] += acc.starting_saldo
            started[acc.id] = True
            off = sum(saldos[id_[j]] for j in range(acc_i))
            
            xy(acc.id, acc.date_created, off)
            off += saldos[acc.id]
            xy(acc.id, acc.date_created, off)
            for j in range(acc_i + 1, n):
                if started[id_[j]]:
                    off += saldos[id_[j]]
                    xy(id_[j], acc.date_created, off)
            xy('f', acc.date_created, off + f)
        
        while trf_i < len(transfers) and (t is None or transfers[trf_i].date_issued < t.date_issued):
            trf = transfers[trf_i]
            trf_i += 1
            if trf.src.currency_id != currency.id and trf.dst.currency_id != currency.id:
                continue
            if trf.src.currency_id == currency.id:
                saldos[trf.src_id] -= trf.src_amount
            if trf.dst.currency_id == currency.id:
                saldos[trf.dst_id] += trf.dst_amount
            off = 0
            for i in range(n):
                if started[id_[i]]:
                    off += saldos[id_[i]]
                    xy(id_[i], trf.date_issued, off)
            xy('f', trf.date_issued, off + f)
        
        if t is not None:
            saldos[t.account_id] += -t.amount if t.is_expense else t.amount
            i = ix[t.account_id]
            off = 0
            for j in range(i + 1):
                if started[id_[j]]:
                    off += saldos[id_[j]]
            
            xy(t.account_id, t.date_issued, off)
            for j in range(i + 1, n):
                if started[id_[j]]:
                    off += saldos[id_[j]]
                    xy(id_[j], t.date_issued, off)

            xy('f', t.date_issued, off+f)

        while f_i < len(flows) and (t is None or flows[f_i].trans.date_issued <= t.date_issued):
            f += -flows[f_i].amount if flows[f_i].is_debt else flows[f_i].amount
            xy('f', flows[f_i].trans.date_issued, off + f)
            f_i += 1


    off = 0
    for i in range(n):
        xy(id_[i], dt.datetime.now(), off)
        off += saldos[id_[i]]
    xy('f', dt.datetime.now(), off)
        
    return jsonify({
        'plots': [{
            'label': 'Flows', 'color': '#ff0000', 'xy': fp
        }] + [accs[key] for key in accs][::-1],
        # 'plots': [accs[key] for key in accs][::-1],
        'curr_code': 'CHF',
        'x_label': 'Time',
        'y_label': 'Net Worth',
    })
