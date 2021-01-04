import ipywidgets as widgets
from IPython.display import display
import matplotlib.pyplot as plt
import seaborn as sns
from .helpers import total_str
import viz.plot as p
from viz.select import select

def category(df, exp, inc, currency, **kwargs):
    cats = widgets.Output()
    with cats:
        plotout = widgets.Output()
        with plotout:

            plt.subplot(1, 2, 1)
            p.bars(select(df=exp, currency=currency), estimator=sum, **kwargs)
            plt.title("Expense Categories")
            plt.yscale("log")
            plt.subplot(1, 2, 2)
            d = inc.copy()
            d['amount'] *= -1
            p.bars(select(df=d, exp=0, currency=currency), estimator=sum, **kwargs)
            plt.title("Income Categories")
            plt.yscale("log")
            plt.show()

        print_exp = widgets.Output()
        with print_exp:
            m = max([len(c) for c in exp.category])
            for cat in sorted(exp.category.unique()):
                print(total_str(exp[exp.category == cat], cat, currency, title_w=m))
        print_inc = widgets.Output()
        with print_inc:
            m = max([len(c) for c in inc.category])
            for cat in sorted(inc.category.unique()):
                print(total_str(inc[inc.category == cat], cat, currency, title_w=m, neg=True))
            
        display(
            widgets.VBox([
                plotout,
                widgets.HBox([
                    print_exp,
                    print_inc
                ])
            ])
        )
    return cats