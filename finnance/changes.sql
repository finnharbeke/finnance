select
    trans.id,
    amount,
    is_expense,
    agent.id as agent_id,
    agent.desc as agent_desc,
    date_issued,
    comment,
    0 as is_transfer
from trans
    join agent on trans.agent_id = agent.id
    where account_id = :id
union
select
    tr.id,
    case when src_id = :id then src_amount else dst_amount end as amount,
    (src_id = :id) as is_expense,
    case when src_id = :id then dst.id else src.id end as agent_id,
    case when src_id = :id then dst.desc else src.desc end as agent_desc,
    date_issued,
    comment,
    1 as is_transfer
from account_transfer as tr
    join account as src on src_id = src.id
    join account as dst on dst_id = dst.id
    where src_id = :id or dst_id = :id
order by date_issued;