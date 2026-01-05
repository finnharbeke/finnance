
from calendar import monthrange
from datetime import datetime, timedelta
from functools import wraps
from http import HTTPStatus

import sqlalchemy
from finnance.errors import APIError
from finnance.models import Account, AccountTransfer, Agent, Category, Currency, Record, Transaction
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

nivo = Blueprint('nivo', __name__, url_prefix='/api/nivo')

def nivo_wrapper(foo):
    @wraps(foo)
    def wrapper(**kwargs):
        params = request.args.to_dict()
        if 'currency_id' not in params:
            raise APIError(HTTPStatus.BAD_REQUEST, 'currency_id must be in search parameters')
        try:
            c_id = int(params['currency_id'])
        except ValueError:
            raise APIError(HTTPStatus.BAD_REQUEST, 'currency_id must be integer')
        currency = Currency.query.filter_by(id=c_id, user_id=current_user.id).first()
        if currency is None:
            raise APIError(HTTPStatus.BAD_REQUEST, "invalid currency_id")
        if 'min_date' not in params:
            raise APIError(HTTPStatus.BAD_REQUEST, 'min_date must be in search parameters')
        try:
            min_date = datetime.fromisoformat(params['min_date'])
        except ValueError:
            raise APIError(HTTPStatus.BAD_REQUEST, "min_date: invalid iso format")
        if 'max_date' not in params:
            raise APIError(HTTPStatus.BAD_REQUEST, 'min_date must be in search parameters')
        try:
            max_date = datetime.fromisoformat(params['max_date'])
        except ValueError:
            raise APIError(HTTPStatus.BAD_REQUEST, "max_date: invalid iso format")

        return foo(currency=currency, min_date=min_date, max_date=max_date, **kwargs)
    return wrapper # bc view function mappings

def is_expense_wrapper(foo):
    @wraps(foo)
    def wrapper(**kwargs):
        params = request.args.to_dict()
        if 'is_expense' not in params:
            raise APIError(HTTPStatus.BAD_REQUEST, 'is_expense must be in search parameters')
        if params['is_expense'] not in ['true', 'false']:
            raise APIError(HTTPStatus.BAD_REQUEST, "is_expense must be either 'true' or 'false'")
        is_expense = params['is_expense'] == 'true'
        return foo(**kwargs, is_expense=is_expense)
    return wrapper

@nivo.route("/sunburst")
@login_required
@nivo_wrapper
@is_expense_wrapper
def sunburst(currency: Currency, is_expense: bool, min_date: datetime, max_date: datetime):
    def agents(cat, path):
        query = Agent.query.join(Transaction).join(Record).join(Category
            ).filter(Transaction.currency_id == currency.id).filter(Category.id == cat.id)
        if min_date is not None:
            query = query.filter(Transaction.date_issued >= min_date)
        if max_date is not None:
            query = query.filter(Transaction.date_issued < max_date)
        query = query.group_by(Agent).with_entities(
                sqlalchemy.func.sum(Record.amount).label('value'), 
                Agent.desc.label('name')
            )
        return [
            dict(
                color=cat.color,
                id=f'{path}.{row._asdict()["name"]}',
                **row._asdict()
            )
            for row in query
        ]

    def cat_obj(cat: Category, path=''):
        cat_children = Category.query.filter_by(parent_id=cat.id, user_id=current_user.id).order_by(Category.order).all()

        path = f'{path}.{cat.desc}'
        children = [
            cat_obj(ch, path=path) for ch in cat_children
        ] + agents(cat, path)
        
        return {
            'id': path,
            'name': cat.desc,
            'color': cat.color,
            'children': children,
        }

    data = []
    for cat in Category.query.filter_by(parent_id=None, user_id=current_user.id, is_expense=is_expense
                                        ).order_by(Category.order):
        obj = cat_obj(cat)
        data.append(obj)
    return jsonify({'id': 'sunburst', 'color': '#ff0000', 'children': data})

@nivo.route("/bars")
@login_required
@nivo_wrapper
@is_expense_wrapper
def bars(currency: Currency, is_expense: bool, min_date: datetime, max_date: datetime):
        
    def value(cat):
        query = Category.query.filter_by(id=cat.id).join(Record).join(
            Transaction).filter_by(currency_id=currency.id)
        if min_date is not None:
            query = query.filter(Transaction.date_issued >= min_date)
        if max_date is not None:
            query = query.filter(Transaction.date_issued < max_date)
        query = query.group_by(Category).with_entities(
                sqlalchemy.func.sum(Record.amount).label('value'), 
            )
        row = query.first()
        if row is None:
            return 0
        return row._asdict()['value']

    keys = []
    values = []

    bar_totals = dict()

    def bar_obj(cat):
        bar = {
            'category': cat.desc,
            'color': cat.color,
        }

        def children(parent):
            prevSum = sum(values)
            v = value(parent)
            if v > 0:
                keys.append(parent.desc)
                values.append(v)
                bar[parent.desc] = value(parent)
                bar[f"{parent.desc}_color"] = parent.color
            cat_children = Category.query.filter_by(parent_id=parent.id, user_id=current_user.id).order_by(Category.order).all()
            for child in cat_children:
                children(child)
            if parent.parent is None:
                myTotal = sum(values) - prevSum
                bar_totals[parent.desc] = myTotal
            
        children(cat)
        if len(bar.keys()) == 2:
            return None
        return bar

    data = []
    for cat in Category.query.filter_by(parent_id=None, user_id=current_user.id, is_expense=is_expense
                                        ).order_by(Category.order):
        bar = bar_obj(cat)
        if bar is not None:
            data.append(bar)

    # nivo expects all keys on all bars
    for key in keys:
        for bar in data:
            if key not in bar:
                bar[key] = 0
                bar[f"{key}_color"] =  Category.query.filter_by(
                    desc=key, is_expense=is_expense, user_id=current_user.id
                ).first().color

    big3 = [kv[0] for kv in sorted(bar_totals.items(), key=lambda kv: kv[1], reverse=True)[:3]]
    if len(data) > 3:
        other = {
            'category': 'other',
            'color': '#555555',
        }
        for bar in data:
            if bar['category'] not in big3:
                for key in bar:
                    if key == 'color' or key == 'category':
                        continue
                    elif key.endswith('_color'):
                        other[key] = bar[key]
                    else:
                        other[key] = other.get(key, 0) + bar[key]
        data.append(other)
    data = list(filter(lambda bar: bar['category'] in (big3 + ['other']), data))

    return jsonify({'data': data, 'keys': keys, 'total': sum(values)})

def end_of_month(dt: datetime):
    return datetime(dt.year, dt.month, monthrange(dt.year, dt.month)[1], 23, 59, 59) + timedelta(seconds=1)

@nivo.route("/divbars")
@login_required
@nivo_wrapper
def diverging_bars(currency: Currency, min_date: datetime, max_date: datetime):
    
    data = []
    keys = []

    start = min_date
    end = end_of_month(start)
    while start < max_date:
        bar = {
            'month': start.isoformat()
        }

        def add_total(cat: Category):
            # same desc category for income & expenses, e.g. gifts
            if cat.desc in bar and not cat.is_expense:
                key = f"{cat.desc}+"
            else:
                key = cat.desc
            if key not in keys:
                keys.append(key)
            row = Record.query.filter_by(category_id=cat.id).join(
                Transaction).filter_by(currency_id=currency.id).filter(Transaction.date_issued >= start).filter(Transaction.date_issued < end
                ).with_entities(sqlalchemy.func.sum(Record.amount).label('value')).first()

            total = row._asdict()['value']
            if total is None:
                total = 0
            if cat.is_expense:
                bar[key] = total
                bar['total_expenses'] = bar.get('total_expenses', 0) + total
            else:
                bar[key] = -total
                bar['total_income'] = bar.get('total_income', 0) + total

            bar[f"{key}_color"] = cat.color
            for child in Category.query.filter_by(
                user_id=current_user.id, parent_id=cat.id).order_by(Category.order.desc()):
                add_total(child)

        for cat in Category.query.filter_by(user_id=current_user.id, 
                                            is_expense=True, parent_id=None).order_by(Category.order.desc()):
            add_total(cat)
        for cat in Category.query.filter_by(user_id=current_user.id, 
                                            is_expense=False, parent_id=None).order_by(Category.order.desc()):
            add_total(cat)

        bar['total_exp'] = sum([
            val if key != 'month' and not key.endswith('_color') else 0 for key, val in bar.items()
        ])
        bar['total_inc'] = sum([
            val if key != 'month' and not key.endswith('_color') else 0 for key, val in bar.items()
        ])

        data.append(bar)
        start = end
        end = end_of_month(start)
        if end > max_date:
            end = max_date

    cut = 0
    while cut < len(data) and data[cut]['total_expenses'] == 0 and data[cut]['total_income'] == 0:
        cut += 1
    data = data[cut:]

    return jsonify({'data': data, 'keys': list(keys)})


@nivo.route("/line")
@login_required
@nivo_wrapper
def line(currency: Currency, min_date: datetime, max_date: datetime):
    start = min_date
    end = end_of_month(start)

    data = []

    while start < max_date:

        exp = Record.query.with_entities(
             sqlalchemy.func.sum(Record.amount).label("sum")
        ).join(Transaction).filter_by(
            currency_id=currency.id,
            is_expense=True
        ).filter(
            Transaction.date_issued >= start
        ).filter(
            Transaction.date_issued < end
        ).first()
        inc = Record.query.with_entities(
             sqlalchemy.func.sum(Record.amount).label("sum")
        ).join(Transaction).filter_by(
            currency_id=currency.id,
            is_expense=False
        ).filter(
            Transaction.date_issued >= start
        ).filter(
            Transaction.date_issued < end
        ).first()
        month = {
            'expenses': 0 if exp is None or exp.sum is None else exp.sum,
            'income': 0 if inc is None or inc.sum is None else inc.sum,
            'month': start.isoformat()
        }

        data.append(month)
        
        start = end
        end = end_of_month(start)
        if end > max_date:
            end = max_date

    cut = 0
    while cut < len(data) and data[cut]['expenses'] == 0 and data[cut]['income'] == 0:
        cut += 1
    data = data[cut:]

    return jsonify(data)


def _minimum_balance_line(currency: Currency, min_date: datetime, max_date: datetime, timescale: str):
    """
    Calculate minimum balance per timescale across all user's accounts in this currency.
    
    Args:
        currency: Currency object
        min_date: Start date for the range
        max_date: End date for the range
        timescale: Either 'month' or 'year'
    """
    from finnance.models import AccountTransfer
    
    # Get all accounts for this currency
    accs_with_currency = Account.query.filter_by(currency_id=currency.id, user_id=current_user.id).all()
    
    if not accs_with_currency:
        return []

    # Start with sum of all account starting balances
    # THIS NEEDS TO BE CHANGED BY THE KING OF FINNANCE
    total_saldo = sum(acc.starting_saldo for acc in accs_with_currency)
    
    # Collect ALL changes (transactions + transfers) for all accounts (entire history)
    all_changes = []
    for account in accs_with_currency:
        all_changes.extend(account.transactions)
        all_changes.extend(account.out_transfers)
        all_changes.extend(account.in_transfers)
    
    # Sort by date
    all_changes = sorted(all_changes, key=lambda ch: ch.date_issued)
    
    # Initialize period boundaries based on timescale
    data = []
    if timescale == 'month':
        period_start = min_date
        period_end = end_of_month(period_start) if end_of_month(period_start) < max_date else max_date
        period_key = 'month'
    else:  # year
        period_start = min_date.replace(month=1, day=1)
        period_end = min_date.replace(year=min_date.year + 1, month=1, day=1) if min_date.replace(year=min_date.year + 1, month=1, day=1) < max_date else max_date
        period_key = 'year'
        
    period_min = total_saldo
    period_max = total_saldo
    
    for change in all_changes:
        # Calculate amount and whether it's an expense (decreases balance)
        if type(change) is AccountTransfer:
            # For transfers, check if this account is the source (money going out)
            account_ids = {acc.id for acc in accs_with_currency}
            is_expense = change.src_id in account_ids
            amount = change.src_amount if is_expense else change.dst_amount
        else:
            # Transaction
            is_expense = change.is_expense
            amount = change.amount
            
        if change.date_issued > period_end:
            # then we arrive in a new period
            while period_end < change.date_issued:
                # Record minimum balance for the period
                data.append({
                    'min': period_min,
                    'max': period_max,
                    period_key: period_start.isoformat()
                })
                # Move to next period
                if timescale == 'month':
                    period_start = period_end
                    period_end = end_of_month(period_start)
                    if period_end > max_date:
                        period_end = max_date
                    
                else:  # year
                    period_start = period_end
                    period_end = period_end.replace(year=period_end.year + 1) if period_end.year < max_date.year else max_date
                if period_end >= max_date:
                    break
                period_min = total_saldo
                period_max = total_saldo
            if change.date_issued > max_date:
                break
        
        # Update balance: income adds, expense subtracts
        total_saldo = total_saldo + (amount if not is_expense else -amount)
        
        if change.date_issued < period_start:
            continue  # before the whole window
        
        if total_saldo < period_min:
            period_min = total_saldo
        
        if total_saldo > period_max:
            period_max = total_saldo
        
    while period_end <= max_date:
        # Record minimum balance for the period
        data.append({
            'min': period_min,
            'max': period_max,
            period_key: period_start.isoformat()
        })
        # Move to next period
        if timescale == 'month':
            period_start = period_end
            period_end = end_of_month(period_start)
            if period_end >= max_date:
                break
        else:  # year
            period_start = period_end
            period_end = period_end.replace(year=period_end.year + 1) if period_end.year < max_date.year else max_date
        period_min = total_saldo
        period_max = total_saldo
        if period_end >= max_date:
            break
        

    return data


@nivo.route("/monthminline")
@login_required
@nivo_wrapper
def MonthMinLine(currency: Currency, min_date: datetime, max_date: datetime):
    """Calculate minimum balance per month across all user's accounts in this currency"""
    data = _minimum_balance_line(currency, min_date, max_date, 'month')
    return jsonify(data)


@nivo.route("/yearminline")
@login_required
@nivo_wrapper
def YearMinLine(currency: Currency, min_date: datetime, max_date: datetime):
    """Calculate minimum balance per year across all user's accounts in this currency"""
    data = _minimum_balance_line(currency, min_date, max_date, 'year')
    return jsonify(data)


@nivo.route("/transactionbalanceline")
@login_required
@nivo_wrapper
def transactionbalanceline(currency: Currency, min_date: datetime, max_date: datetime):
    """Return balance after every single transaction within the date range"""
    from finnance.models import AccountTransfer
    
    # Get all accounts for this currency
    accs_with_currency = Account.query.filter_by(currency_id=currency.id, user_id=current_user.id).all()
    
    if not accs_with_currency:
        return jsonify([])

    # Start with sum of all account starting balances
    # THIS NEEDS TO BE CHANGED BY THE KING OF FINNANCE
    total_saldo = sum(acc.starting_saldo for acc in accs_with_currency)
    
    # Collect ALL changes (transactions + transfers) for all accounts (entire history)
    all_changes = []
    for account in accs_with_currency:
        all_changes.extend(account.transactions)
        all_changes.extend(account.out_transfers)
        all_changes.extend(account.in_transfers)
    
    # Sort by date
    all_changes = sorted(all_changes, key=lambda ch: ch.date_issued)
    
    # Process all transactions and build data points
    data = []
    done_transfers = set()
    
    for change in all_changes:
        # Calculate amount and whether it's an expense (decreases balance)
        if type(change) is AccountTransfer:
            # For transfers, check if this account is the source (money going out)
            
            if change.id in done_transfers:
                continue  # already processed this transfer
            
            account_ids = {acc.id for acc in accs_with_currency}
            
            if change.src_id in account_ids:
                total_saldo -= change.src_amount
            if change.dst_id in account_ids:
                total_saldo += change.dst_amount
                
            done_transfers.add(change.id)
            
        else:
            # Transaction
            is_expense = change.is_expense
            amount = change.amount
            
            total_saldo += (amount if not is_expense else -amount)
        
        # Only include transactions within the requested date range
        if change.date_issued >= min_date and change.date_issued < max_date:
            data.append({
                'balance': total_saldo,
                'date': change.date_issued.isoformat()
            })
    
    return jsonify(data)


@nivo.route("/categories")
@login_required
@nivo_wrapper
@is_expense_wrapper
def categories(currency: Currency, is_expense: bool, min_date: datetime, max_date: datetime):
    positive = lambda d: d['total'] > 0

    def compute(cat: Category):
        query = Record.query.filter_by(
            category_id=cat.id
        ).with_entities(
             sqlalchemy.func.sum(Record.amount).label("total")
        ).join(Transaction).filter_by(
            currency_id=currency.id
        ).filter(
            Transaction.date_issued >= min_date
        ).filter(
            Transaction.date_issued < max_date
        ).first()
        total = 0 if query is None or query.total is None else query.total
        children = list(filter(positive, [
                compute(cat) for cat in Category.query.filter_by(parent_id=cat.id, user_id=current_user.id)
            ]))
        totaltotal = total + sum([d['total'] for d in children])
        return {
            'category': cat.json(deep=False),
            'total': totaltotal,
            'children': children
        }
    
    data = list(filter(positive, [
        compute(cat) for cat in Category.query.filter_by(
            parent_id=None, user_id=current_user.id, is_expense=is_expense
        )
    ]))

    return jsonify(data)

