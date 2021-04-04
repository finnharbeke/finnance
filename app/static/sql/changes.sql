select
    trans.id,
    amount,
    case when (direct_flow_in is null) then category.is_expense else not direct_flow_in end as is_expense,
    agent.id as agent_id,
    agent.desc as agent_desc,
    date_issued,
    category.id as cat_id,
    direct_flow_in,
    comment
from trans
    left outer join category on trans.category_id = category.id
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
    NULL as cat_id,
    NULL as direct_flow_in,
    comment
from account_transfer as tr
    join account as src on src_id = src.id
    join account as dst on dst_id = dst.id
    where src_id = :id or dst_id = :id
order by date_issued;