

def tr_str(tr, scope=None, width=7, dec=2, agent=True, category=False, comment=False):
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
    
    to = 'an' if tr.is_expense else 'von'
    return (
        f"{get_date(tr, scope)}: "
        f"{tr.amount:{width}.{dec}f} {tr.currency}"
        f"{f' {to} {tr.agent}'   if agent    else ''}"
        f"{f' ({tr.comment})'  if comment  else ''}"
        f"{f' [{tr.category}]' if category else ''}"
    )


def total_str(df, title, currency, title_w=None, left_allign=True, n_w=7, n_dec=2, count_w=2):
    assert df.currency.unique().tolist() == [currency] or df.currency.unique().tolist() == []
    if title_w is None:
        title_w = len(title)
    amount = df.amount.sum()
    return (
        f"{title:{'<' if left_allign else '>'}{title_w}}: "
        f"{amount:{n_w}.{n_dec}f} {currency}"
        f"{f', {df.shape[0]:{count_w}} Transactions' if count_w != 0 else ''}"
    )

