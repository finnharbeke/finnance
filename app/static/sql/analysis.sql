select
    amount,
    date_issued,
    category.is_expense,
    category.id as cat_id,
    category.desc as category,
    agent.id as agent_id,
    agent.desc as agent,
    comment,
    currency.code as currency,
    account.id as account_id,
    account.desc as account
from trans
    left outer join category on trans.category_id = category.id
    join agent on trans.agent_id = agent.id
    join account on trans.account_id = account.id
    join currency on account.currency_id = currency.id
    where trans.category_id is not null and (:cid = 0 or account.currency_id = :cid)
union
select
    amount,
    date_issued,
    remote_flow.is_expense,
    category.id as cat_id,
    category.desc as category,
    agent.id as agent_id,
    agent.desc as agent,
    comment,
    currency.code as currency,
    0 as account_id,
    "remote" as account
from remote_flow
    join category on remote_flow.category_id = category.id
    join agent on remote_flow.trans_agent_id = agent.id
    join currency on remote_flow.currency_id = currency.id
    where (:cid = 0 or remote_flow.currency_id = :cid)
order by date_issued;