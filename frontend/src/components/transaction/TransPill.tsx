import { Center, Loader, Title, useMantineTheme } from "@mantine/core";
import { DateTime } from "luxon";
import { TbMinus, TbPlus } from "react-icons/tb";
import useAmount from "../../hooks/useAmount";
import useIsPhone from "../../hooks/useIsPhone";
import { useCurrency } from "../../types/Currency";
import { TransactionDeepQueryResult, useTransactions } from "../../types/Transaction";
import { DataPill } from "../DataPill";
import { FilterPagination, useFilterPagination } from "../Filter";
import Placeholder from "../Placeholder";
import { openEditTransactionModal } from "./TransactionModal";

export function FilterableRemotes() {
    const [filter, setFilter] = useFilterPagination();
    const query = useTransactions({ ...filter, account_id: null });

    if (query.isError)
        return <Placeholder height={300} queries={[query]} />

    return <>
        <TransPills transactions={query.data?.transactions} />
        <FilterPagination filter={filter} setFilter={setFilter} pages={query.data?.pages} />
    </>
}

export const TransPills = ({ transactions }: { transactions: TransactionDeepQueryResult[] | undefined }) => {
    if (transactions === undefined)
        return <Center><Loader /></Center>
    return transactions.length > 0 ?
        <>{
            transactions.map((t, ix) =>
                <TransPill trans={t} key={ix} />
            )
        }</>
        :
        <Title order={4} align='center'>no transactions found</Title>
}

const TransPill = ({ trans }: { trans: TransactionDeepQueryResult }) => {
    const query = useCurrency(trans.currency_id);
    const theme = useMantineTheme();
    const isPhone = useIsPhone();

    const iconColor = theme.colors[
        trans.is_expense ? 'red' : 'blue'
    ][
        theme.colorScheme === 'light' ? 3 : 6
    ];
    const color = theme.colors[
        trans.is_expense ? 'red' : 'blue'
    ][
        theme.colorScheme === 'light' ? 4 : 6
    ];

    const date = DateTime.fromISO(trans.date_issued);
    const amount = useAmount(trans.amount, query.data, false);

    if (!query.isSuccess)
        return <Placeholder height={40} queries={[query]} />

    return <DataPill cells={[
        {
            type: 'icon',
            col: {
                span: 3, sm: 1
            },
            cell: {
                style: { backgroundColor: iconColor },
                icon: trans.is_expense ? TbMinus : TbPlus
            }
        },
        {
            type: 'text',
            col: {
                span: 7, sm: 3
            },
            cell: {
                align: 'center',
                text: date.toFormat('dd.MM.yy')
            }
        },
        {
            type: 'text',
            col: {
                span: 5, sm: 2
            },
            cell: {
                align: 'center',
                text: date.toFormat('HH:mm')
            }
        },
        {
            type: 'text',
            col: {
                span: 9, sm: 2
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
                span: 12, sm: 5, order: isPhone ? 9 : 5
            },
            cell: {
                align: 'left',
                text: trans.agent.desc
            }
        },
        {
            type: 'text',
            col: {
                span: 9, sm: 5, order: isPhone ? 10 : 6
            },
            cell: {
                align: 'left',
                text: trans.account_id !== null ?
                    trans.account.desc : trans.flows[0].agent_desc,
                color: trans.account_id === null ? 'grape' : theme.primaryColor,
                link: trans.account_id === null ? undefined : `/accounts/${trans.account_id}`
            }
        },
        {
            type: 'edit',
            col: {
                span: 3, sm: 1, order: 8
            },
            cell: {
                onEdit: () =>
                    openEditTransactionModal({
                        title: `edit transaction #${trans.id}`,
                        fullScreen: isPhone,
                        innerProps: {
                            transaction_id: trans.id
                        }
                    }),
            }
        },
        {
            type: 'text',
            col: {
                span: trans.comment === '' && isPhone ? -1 : 24,
                sm: 5,
                order: isPhone ? 11 : 7
            },
            cell: {
                align: 'left',
                text: trans.comment,
            }
        }
    ]} />
}