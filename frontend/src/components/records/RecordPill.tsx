import { Center, Loader, Title, useMantineTheme } from "@mantine/core";
import { DateTime } from "luxon";
import { TbTrendingDown, TbTrendingUp } from "react-icons/tb";
import { editTransactionAction } from "../../actions/actions";
import useAmount from "../../hooks/useAmount";
import { useCurrency } from "../../types/Currency";
import { RecordDeepQueryResult, useRecords } from "../../types/Record";
import { StandardPill } from "../DataPill";
import { FilterPagination, useFilterPagination } from "../Filter";
import Placeholder from "../Placeholder";

export function FilterableRecords() {
    const [filter, setFilter] = useFilterPagination();
    const query = useRecords({ ...filter });

    if (query.isError)
        return <Placeholder height={300} queries={[query]} />

    return <>
        <RecordPills records={query.data?.records} />
        <FilterPagination filter={filter} setFilter={setFilter} pages={query.data?.pages} categorySearch />
    </>
}

export const RecordPills = ({ records }: { records: RecordDeepQueryResult[] | undefined }) => {
    if (records === undefined)
        return <Center><Loader /></Center>
    return records.length > 0 ?
        <>{
            records.map((f, ix) =>
                <RecordPill record={f} key={ix} />
            )
        }</>
        :
        <Title order={4} ta='center'>no records found</Title>
}

const RecordPill = ({ record }: { record: RecordDeepQueryResult }) => {
    const theme = useMantineTheme();
    const query = useCurrency(record.trans.currency_id);
    const amount = useAmount(record.amount, query.data);

    return <StandardPill {...{
        icon: record.category.is_expense ? TbTrendingDown : TbTrendingUp,
        iconColor: `var(--mantine-color-${record.category.is_expense ?
            theme.other.colors.expense :
            theme.other.colors.income}-filled)`,
        datetime: DateTime.fromISO(record.trans.date_issued),
        amount,
        is_expense: record.category.is_expense,
        label: {
            text: record.category.desc
        },
        onEdit: () => editTransactionAction(record.trans.id),
        comment: record.trans.comment
    }}/>
}