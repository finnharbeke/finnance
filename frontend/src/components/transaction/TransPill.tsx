import { useMantineTheme, Text } from "@mantine/core";
import { TransactionDeepQueryResult, useTransactions } from "../../types/Transaction";
import { DataPill } from "../DataPill";
import { TbMinus, TbPlus } from "react-icons/tb";
import { DateTime } from "luxon";
import useAmount from "../../hooks/useAmount";
import { useCurrency } from "../../types/Currency";
import Placeholder from "../Placeholder";
import useIsPhone from "../../hooks/useIsPhone";
import { Link } from "react-router-dom";
import { openEditTransactionModal } from "./TransactionModal";

export const RemotePills = () => {
    const query = useTransactions({
        pagesize: 10, page: 0, account_id: null
    })

    if (!query.isSuccess)
        return <Placeholder height={300} queries={[query]} />

    return <>{
        query.data.transactions.map(t => <TransPill trans={t} />)
    }</>
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
                children: <Text color={color}>
                    {amount}
                </Text>
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
                children: trans.account_id === null ?
                    <Text color='grape'>
                        {trans.flows[0].agent_desc}
                    </Text>
                    :
                    <Text component={Link} color={theme.primaryColor}
                        to={`/accounts/${trans.account_id}`}>
                        {trans.account.desc}
                    </Text>
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