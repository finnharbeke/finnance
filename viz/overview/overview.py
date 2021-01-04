import datetime as dt
import ipywidgets as widgets
from IPython.display import display
import viz.select as s
import viz.widgets as w

def overview(df, currency, lim=50, scope=None, palette=None):
    #df = df[(df.category_id != 13) & (df.category_id != 20)].sort_values('date_issued')
    exp = s.select(df=df, exp= 1, currency=currency)
    inc = s.select(df=df, exp=-1, currency=currency)
        
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
    df = s.select(df=df, exp=0, date_start=start, date_end=end, currency=currency, **kwargs)
    overview(df, currency, scope="month", lim=lim, palette=palette)