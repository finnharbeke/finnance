import matplotlib.pyplot as plt
import seaborn as sns

def time_plot(min_min, max_min):
    s = min_min // 60
    e = max_min // 60 + 1
    e += 1 if max_min % 60 else 0
    xticks = [f"{i:02d}" for i in range(s, e)]
    pos = [i*60 for i in range(s, e)]
    plt.xticks(pos, xticks)

def scatter(df, x='time', hue='category', marker='p', style='account', **kwargs):
    sns.scatterplot(data=df, x=x, y='amount', hue=hue, marker=marker, style=style, **kwargs)
    if x == 'time':
        time_plot(df.time.min(), df.time.max())

def bars(df, x='category', **kwargs):
    ax = sns.barplot(data=df, x=x, y='amount', **kwargs)
    for item in ax.get_xticklabels():
        item.set_rotation(90)

def hist(df, hue='category', **kwargs):
    sns.histplot(data=df, x='amount', hue=hue, **kwargs)