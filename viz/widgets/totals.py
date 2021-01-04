import ipywidgets as widgets
from .helpers import total_str
from viz.select import select

def totals(df, c):
    assert df.currency.unique().tolist() == [c]
    out = widgets.Output()
    with out:
        te = "Total Expenses"
        kwargs = dict([
            ('n_w', 8),
            ('left_allign', False),
            ('currency', c),
            ('title_w', len(te))
            
        ])
        print(total_str(select(df, exp=1, currency=c), te, **kwargs))
        print(total_str(select(df, exp=-1, currency=c), "Total Income", **kwargs))
        print(total_str(select(df, currency=c), "Total", **kwargs))
    return out