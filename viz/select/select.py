import datetime as dt

def select(df, currency='CHF', exp=None,
            amount_max=None, amount_min=None, categories=[],
            date_start=None, date_end=None, date_format='%Y-%m-%d', 
            time_start=None, time_end=None, time_format='%H:%M'):
    
    
    res = df[df.currency == currency]
    if exp is True:
        res = res[res.is_expense]
    elif exp is False:
        res = res[~res.is_expense]
    if amount_max:
        res = res[res.amount <= amount_max]
    if amount_min is not None:
        res = res[res.amount >= amount_min]
    if date_start:
        if type(date_start) == str:
            date_start = dt.datetime.strptime(date_start, date_format)
        res = res[res.date_issued >= date_start]
    if date_end:
        if type(date_end) == str:
            date_end = dt.datetime.strptime(date_end, date_format)
        res = res[res.date_issued <= date_end]
    if time_start:
        if type(time_start) == str:
            time_start = dt.datetime.strptime(time_start, time_format)
        time_start = time_start.hour * 60 + time_start.minute
        res = res[res.time >= time_start]
    if time_end:
        if type(time_end) == str:
            time_end = dt.datetime.strptime(time_end, time_format)
        time_end = time_end.hour * 60 + time_end.minute
        res = res[res.time < time_end]
    if categories:
        res = res[res.category_id.isin(categories) | res.category.isin(categories)]
    
    return res