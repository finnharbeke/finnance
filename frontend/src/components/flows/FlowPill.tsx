import { Center, Loader, Title, useMantineTheme } from "@mantine/core";
import { DateTime } from "luxon";
import { TbMinus, TbPlus } from "react-icons/tb";
import { FlowDeepQueryResult, useFlows } from "../../types/Flow";
import { DataPill } from "../DataPill";
import useAmount from "../../hooks/useAmount";
import { useCurrency } from "../../types/Currency";
import { FilterPagination, useFilterPagination } from "../Filter";
import Placeholder from "../Placeholder";
import { editTransactionAction } from "../../actions/actions";

export function FilterableFlows() {
    const [filter, setFilter] = useFilterPagination();
    const query = useFlows({ ...filter });

    if (query.isError)
        return <Placeholder height={300} queries={[query]} />

    return <>
        <FlowPills flows={query.data?.flows} />
        <FilterPagination filter={filter} setFilter={setFilter} pages={query.data?.pages} />
    </>
}

export const FlowPills = ({ flows }: { flows: FlowDeepQueryResult[] | undefined }) => {
    if (flows === undefined)
        return <Center><Loader /></Center>
    return flows.length > 0 ?
        <>{
            flows.map((f, ix) =>
                <FlowPill flow={f} key={ix} />
            )
        }</>
        :
        <Title order={4} align='center'>no flows found</Title>
}

const FlowPill = ({ flow }: { flow: FlowDeepQueryResult }) => {
    const theme = useMantineTheme();
    const query = useCurrency(flow.trans.currency_id);
    const amount = useAmount(flow.amount, query.data);

    const color = theme.colors[
        flow.is_debt ? 'red' : 'blue'
    ][
        theme.colorScheme === 'light' ? 4 : 6
    ];

    return <DataPill cells={[
        {
            type: 'icon',
            col: {
                span: 3, sm: 1
            },
            cell: {
                style: { backgroundColor:
                    theme.colors.grape[theme.fn.primaryShade()]
                }, icon: flow.is_debt ? TbMinus : TbPlus
            }
        },
        {
            type: 'text',
            col: {
                span: 11, sm: 3
            },
            cell: {
                align: 'center',
                text: DateTime.fromISO(flow.trans.date_issued).toFormat('dd.MM.yy')
            }
        },
        {
            type: 'text',
            col: {
                span: 10, sm: 4
            },
            cell: {
                align: 'right',
                text: amount,
                color: color
            }
        },
        {
            type: 'text',
            col: {
                span: 11, sm: 7, order: 9, orderSm: 5
            },
            cell: {
                align: 'left',
                text: flow.agent.desc
            }
        },
        {
            type: 'text',
            col: {
                span: 10, sm: 8, order: 10, orderSm: 6
            },
            cell: {
                align: 'left',
                text: flow.trans.comment
            }
        },
        {
            type: 'edit',
            col: {
                span: 3, sm: 1, order: 8
            },
            cell: {
                onEdit: () =>
                    editTransactionAction(flow.trans.id),
            }
        },
    ]} />
}