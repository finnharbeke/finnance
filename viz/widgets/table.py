import ipywidgets as widgets
from IPython.display import display
import numpy as np

def table(df):
    ALL = 'ALL'
    trans = widgets.Output()
    with trans:
        out = widgets.Output()
        category = widgets.Dropdown(options=np.append([ALL], sorted(df.category.unique())), value=ALL) 
        display(category)
        
        def update(change):
            out.clear_output()
            with out:
                to_disp = df[df.category == change.new] if category.value != ALL else df
                display(to_disp[['date_issued', 'amount', 'agent', 'category', 'account', 'comment']])
        category.observe(update, names='value')
        display(out)
    return trans