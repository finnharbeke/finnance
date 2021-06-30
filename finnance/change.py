import datetime
from finnance.models import AccountTransfer, Agent, Category, Transaction

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

        date_issued = datetime.datetime.strptime(d.get('date_issued'), "%Y-%m-%d %H:%M:%S.%f")

        
        return Change(int(d.get('id')), account, bool(d.get('is_expense')),
                      float(d.get('amount')), int(d.get('agent_id')), 
                      d.get('agent_desc'), date_issued, 
                      d.get('comment'), bool(d.get('is_transfer')))

    def __init__(self, id: int, account, 
                 is_expense: bool, amount: float,
                 agent_id: int, agent_desc: str, 
                 date_issued: datetime.datetime,  
                 comment: str, is_transfer: bool):
        
        self.id = id
        self.account = account
        self.is_expense = is_expense
        self.amount = amount
        self.agent_id = agent_id
        self.agent = agent_desc
        self.date_issued = date_issued
        self.transfer = is_transfer
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