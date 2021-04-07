import datetime
from app.main.models import AccountTransfer, Agent, Category, Transaction

class Change:
    """Class acting like a View, combining `AccountTransfer` and `Transaction`
    into one for all of the Balance Changes of an `Account`.

    Attributes:
        account: `Account`
        date_issued: `datetime.datetime` for chronological order
        amount: float
        is_expense: bool
        saldo: float, saldo of account following this balance change
        category: `Category.desc` or `"transfer"`
        category_id: `Category.id` or None
        agent: `Agent.desc` or `Account.desc`
        agent_id: `Agent.id` or `Account.id`
        comment: str
    """

    @staticmethod
    def from_dict(d: dict, account) -> 'Change':
        """Instantiate `Change` from dictionary"""
        direct_flow_in = d.get('direct_flow_in')
        if direct_flow_in is not None:
            direct_flow_in = bool(direct_flow_in)

        if d.get('cat_id') is None:
            if direct_flow_in is not None:
                cat_desc = "flow"
            else:
                cat_desc = "transfer"
            cat_id = None
        else:
            cat_id = int(d.get('cat_id'))
            cat_desc = Category.query.get(cat_id).desc

        date_issued = datetime.datetime.strptime(d.get('date_issued'), "%Y-%m-%d %H:%M:%S.%f")

        
        return Change(int(d.get('id')), account, bool(d.get('is_expense')),
                      float(d.get('amount')), int(d.get('agent_id')), 
                      d.get('agent_desc'), date_issued, cat_desc, cat_id, 
                      d.get('comment'), direct_flow_in)

    def __init__(self, id: int, account, 
                 is_expense: bool, amount: float,
                 agent_id: int, agent_desc: str, 
                 date_issued: datetime.datetime, 
                 category: str, category_id: int, 
                 comment: str, direct_flow_in: bool):
        
        self.id = id
        self.account = account
        self.is_expense = is_expense
        self.amount = amount
        self.agent_id = agent_id
        self.agent = agent_desc
        self.date_issued = date_issued
        self.category = category
        self.category_id = category_id
        self.transfer = self.category_id is None and direct_flow_in is None
        self.direct_flow_in = direct_flow_in
        self.comment = comment

        if self.transfer:
            self.original = AccountTransfer.query.get(self.id)
        else:
            self.original = Transaction.query.get(self.id)
        
        self._saldo = None

    def saldo(self, saldo=None, formatted=True):
        if saldo is not None:
            self._saldo = saldo

        return self.account.currency.format(self._saldo) if formatted else self._saldo