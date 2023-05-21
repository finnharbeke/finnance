import { Center, Loader, Title, useMantineTheme } from "@mantine/core";
import { DateTime } from "luxon";
import { TbTrendingDown, TbTrendingUp } from "react-icons/tb";
import { editTransactionAction } from "../../actions/actions";
import useAmount from "../../hooks/useAmount";
import { useCurrency } from "../../types/Currency";
import { RecordDeepQueryResult, useRecords } from "../../types/Record";
import { DataPill } from "../DataPill";
import { FilterPagination, useFilterPagination } from "../Filter";
import Placeholder from "../Placeholder";

export function FilterableRecords() {
    const [filter, setFilter] = useFilterPagination();
    const query = useRecords({ ...filter });

    if (query.isError)
        return <Placeholder height={300} queries={[query]} />

    return <>
        <RecordPills records={query.data?.records} />
        <FilterPagination filter={filter} setFilter={setFilter} pages={query.data?.pages} />
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
        <Title order={4} align='center'>no records found</Title>
}

const RecordPill = ({ record }: { record: RecordDeepQueryResult }) => {
    const theme = useMantineTheme();
    const query = useCurrency(record.trans.currency_id);
    const amount = useAmount(record.amount, query.data);

    const iconColor = theme.colors[
        record.category.is_expense ? 'red' : 'blue'
    ][
        theme.colorScheme === 'light' ? 3 : 6
    ];
    const color = theme.colors[
        record.category.is_expense ? 'red' : 'blue'
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
                style: { backgroundColor: iconColor },
                icon: record.category.is_expense ? TbTrendingDown : TbTrendingUp
            }
        },
        {
            type: 'text',
            col: {
                span: 8, sm: 3
            },
            cell: {
                align: 'center',
                text: DateTime.fromISO(record.trans.date_issued).toFormat('dd.MM.yy')
            }
        },
        {
            type: 'text',
            col: {
                span: 8, sm: 4, order: 5, orderSm: 3
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
                span: 13, sm: 7, order: 3, orderSm: 4
            },
            cell: {
                align: 'left',
                text: record.category.desc,
                color: record.category.color
            }
        },
        {
            type: 'text',
            col: {
                span: 13, sm: 8, order: 6, orderSm: 5
            },
            cell: {
                align: 'left',
                text: record.trans.comment
            }
        },
        {
            type: 'edit',
            col: {
                span: 3, sm: 1, order: 4, orderSm: 6
            },
            cell: {
                onEdit: () =>
                    editTransactionAction(record.trans.id),
            }
        },
    ]} />
}