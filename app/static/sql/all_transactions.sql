select
    trans.id,
    amount,
    category.is_expense,
    date_issued,
    category.desc as cat,
    category.id as cat_id,
    agent.desc as agent,
    agent.id as agent_id,
    comment
from trans
    join category on trans.category_id = category.id
    join agent on trans.agent_id = agent.id
    where account_id = :id
union
select
    tr.id,
    case when src_id = :id then src_amount else dst_amount end as amount,
    (src_id = :id) as is_expense,
    date_issued,
    "transfer" as cat,
    0 as cat_id,
    case when (src_id = :id) then dst.desc else src.desc end as agent,
    case when (src_id = :id) then dst.id else src.id end as agent_id,
    "" as comment
from account_transfer as tr
    join account as src on src_id = src.id
    join account as dst on dst_id = dst.id
    where src_id = :id or dst_id = :id order by date_issued;