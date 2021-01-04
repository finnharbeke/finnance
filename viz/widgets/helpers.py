

def tr_str(tr, scope=None, width=7, dec=2, neg=False, agent=True, category=False, comment=False):
    def get_date(tr, scope):
        if scope is None:
            return tr.date_issued.strftime('%d.%m.%y %H:%M')
        elif scope == "year":
            return tr.date_issued.strftime('%d.%m. %H:%M')
        elif scope == "month":
            return tr.date_issued.strftime('%d. %H:%M')
        elif scope == "day":
            return tr.date_issued.strftime('%H:%M')
        else:
            raise ValueError(f"invalid scope: '{scope}', must be in ['year', 'month', 'day', None].")
    
    amount = tr.amount if not neg else -tr.amount
    to = 'an' if not neg else 'von'
    return (
        f"{get_date(tr, scope)}: "
        f"{amount:{width}.{dec}f} {tr.currency}"
        f"{f' {to} {tr.agent}'   if agent    else ''}"
        f"{f' ({tr.comment})'  if comment  else ''}"
        f"{f' [{tr.category}]' if category else ''}"
    )


def total_str(df, title, currency, title_w=None, left_allign=True, n_w=7, n_dec=2, count_w=2, neg=False):
    assert df.currency.unique().tolist() == [currency]
    if title_w is None:
        title_w = len(title)
    amount = df.amount.sum() if not neg else -df.amount.sum()
    return (
        f"{title:{'<' if left_allign else '>'}{title_w}}: "
        f"{amount:{n_w}.{n_dec}f} {currency}"
        f"{f', {df.shape[0]:{count_w}} Transactions' if count_w != 0 else ''}"
    )

