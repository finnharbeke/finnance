import datetime as dt
import ipywidgets as widgets
from IPython.display import display
from viz.select import select
import viz.widgets as w

def overview(df, currency, lim=50, scope=None, palette=None):
    #df = df[(df.category_id != 13) & (df.category_id != 20)].sort_values('date_issued')
    exp = select(df=df, exp=True, currency=currency)
    inc = select(df=df, exp=False, currency=currency)
        
    tabs = widgets.Tab([
        w.totals(df, currency),
        w.scatters(exp, inc, currency, scope=scope, lim=lim, palette=palette),
        w.category(df, exp, inc, currency, palette=palette),
        w.table(df)
    ])
    tabs.set_title(0, 'Overview')
    tabs.set_title(1, 'Scatters')
    tabs.set_title(2, 'Categories')
    tabs.set_title(3, 'DF')
    display(tabs)


def month_overview(df, month, currency='CHF', lim=50, palette=None, **kwargs):
    from dateutil.relativedelta import relativedelta
    start = dt.datetime.strptime(month, "%m.%y")
    end = start + relativedelta(months=1)
    df = select(df=df, date_start=start, date_end=end, currency=currency, **kwargs)
    overview(df, currency, scope="month", lim=lim, palette=palette)