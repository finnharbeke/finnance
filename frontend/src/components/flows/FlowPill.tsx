import { Center, Loader, Title, useMantineTheme } from "@mantine/core";
import { DateTime } from "luxon";
import { TbArrowWaveLeftUp, TbArrowWaveRightUp } from "react-icons/tb";
import { editTransactionAction } from "../../actions/actions";
import useAmount from "../../hooks/useAmount";
import { useCurrency } from "../../types/Currency";
import { FlowDeepQueryResult, useFlows } from "../../types/Flow";
import { StandardPill } from "../DataPill";
import { FilterPagination, useFilterPagination } from "../Filter";
import Placeholder from "../Placeholder";

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
        <Title order={4} ta='center'>no flows found</Title>
}

const FlowPill = ({ flow }: { flow: FlowDeepQueryResult }) => {
    const theme = useMantineTheme();
    const query = useCurrency(flow.trans.currency_id);
    const amount = useAmount(flow.amount, query.data);

    return <StandardPill {...{
        icon: flow.is_debt ? TbArrowWaveLeftUp : TbArrowWaveRightUp,
        iconColor: theme.other.colors.flow,
        datetime: DateTime.fromISO(flow.trans.date_issued),
        amount,
        is_expense: flow.is_debt,
        label: {
            text: flow.agent.desc
        },
        onEdit: () => editTransactionAction(flow.trans.id),
        comment: flow.trans.comment
    }} />
}