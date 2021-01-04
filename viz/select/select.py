import datetime as dt

def select(df, currency='CHF', account_ids=[], exp=0,
            amount_max=None, amount_min=None, categories=[],
            date_start=None, date_end=None, date_format='%Y-%m-%d', 
            time_start=None, time_end=None, time_format='%H:%M'):
    
    
    my_trs = df[df.currency == currency]
    if account_ids:
        my_trs = my_trs[my_trs.account_id.isin(account_ids)]
    if exp == 1:
        my_trs = my_trs[my_trs.amount >= 0]
    elif exp == -1:
        my_trs = my_trs[my_trs.amount < 0]
    if amount_max:
        my_trs = my_trs[my_trs.amount <= amount_max]
    if amount_min is not None:
        my_trs = my_trs[my_trs.amount >= amount_min]
    if date_start:
        if type(date_start) == str:
            date_start = dt.datetime.strptime(date_start, date_format)
        my_trs = my_trs[my_trs.date_issued >= date_start]
    if date_end:
        if type(date_end) == str:
            date_end = dt.datetime.strptime(date_end, date_format)
        my_trs = my_trs[my_trs.date_issued <= date_end]
    if time_start:
        if type(time_start) == str:
            time_start = dt.datetime.strptime(time_start, time_format)
        time_start = time_start.hour * 60 + time_start.minute
        my_trs = my_trs[my_trs.time >= time_start]
    if time_end:
        if type(time_end) == str:
            time_end = dt.datetime.strptime(time_end, time_format)
        time_end = time_end.hour * 60 + time_end.minute
        my_trs = my_trs[my_trs.time < time_end]
    if categories:
        my_trs = my_trs[my_trs.category_id.isin(categories) | my_trs.category.isin(categories)]
    
    return my_trs