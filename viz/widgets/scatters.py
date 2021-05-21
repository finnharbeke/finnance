import ipywidgets as widgets
import matplotlib.pyplot as plt
from .helpers import tr_str
from viz.select import select
import viz.plot as p

def scatters(exp, inc, currency, scope=None, lim=50, **kwargs):
    plots = widgets.Output()
    with plots:
        title = "Expenses {} Scatter"
        plt.subplot(1, 2, 1)
        p.scatter(select(df=exp, amount_max=lim, currency=currency), x='time', **kwargs)
        plt.title(title.format("Title"))
        plt.subplot(1, 2, 2)
        p.scatter(select(df=exp, amount_max=lim, currency=currency), x='date_issued', **kwargs)
        plt.title(title.format("Date"))
        plt.show()
    
    big_exps = widgets.Output()
    with big_exps:
        for i, tr in exp[exp.amount > lim].iterrows():
            print(tr_str(tr, scope=scope))
    
    incs = widgets.Output()
    with incs:
        for i, tr in inc.iterrows():
            print(tr_str(tr, scope=scope))
    
    return widgets.VBox([
        plots, widgets.HBox([
            big_exps, incs
        ])
    ])