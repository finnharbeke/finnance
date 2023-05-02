import { Center, Loader, Title, useMantineTheme } from "@mantine/core";
import { DateTime } from "luxon";
import { TbArrowsLeftRight, TbMinus, TbPlus } from "react-icons/tb";
import useAmount from "../../hooks/useAmount";
import useIsPhone from "../../hooks/useIsPhone";
import { Change, isChangeTransaction, useAccount, useChanges } from "../../types/Account";
import { DataPill } from "../DataPill";
import { FilterPagination, useFilterPagination } from "../Filter";
import Placeholder from "../Placeholder";
import { openEditTransactionModal } from "../transaction/TransactionModal";
import { openEditTransferModal } from "../transfer/TransferModal";

export function ChangePills({ changes }: { changes: Change[] | undefined }) {
    if (changes === undefined)
        return <Center><Loader /></Center>
    return changes.length > 0 ?
        <>{
            changes.map((change, ix) =>
                <ChangePill change={change} key={ix} />
            )
        }</>
        :
        <Title order={4} align='center'>no changes found</Title>
}

export function FilterableChanges({ id }: { id: number }) {
    const [filter, setFilter] = useFilterPagination();
    const query = useChanges(id, filter);

    if (query.isError)
        return <Placeholder height={300} queries={[query]} />

    return <>
        <ChangePills changes={query.data?.changes} />
        <FilterPagination filter={filter} setFilter={setFilter} pages={query.data?.pages} />
    </>
}

const ChangePill = ({ change }: { change: Change }) => {
    const theme = useMantineTheme();
    const isPhone = useIsPhone();

    const query = useAccount(change.acc_id);
    const isTransfer = !isChangeTransaction(change);
    const isSource = isTransfer && change.data.src_id === change.acc_id;
    const isExpense = (!isTransfer && change.data.is_expense) || isSource;

    const amount = useAmount(isTransfer ?
        isSource ? change.data.src_amount : change.data.dst_amount
        : change.data.amount, query.data?.currency, false)

    const saldo = useAmount(change.saldo, query.data?.currency, false);

    if (!query.isSuccess)
        return <Placeholder height={30} queries={[query]} />

    const date = DateTime.fromISO(change.data.date_issued);

    const iconColor = theme.colors[
        isTransfer ? 'grape' : isExpense ? 'red' : 'blue'
    ][
        theme.colorScheme === 'light' ? 3 : 6
    ];
    const color = theme.colors[
        isExpense ? 'red' : 'blue'
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
                icon: isTransfer ? TbArrowsLeftRight :
                    isExpense ?
                        TbMinus : TbPlus
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
                span: 12, sm: 6, order: isPhone ? 9 : 5
            },
            cell: {
                align: 'left',
                text: change.target,
                link: isTransfer ? `/accounts/${isSource ? change.data.dst_id : change.data.src_id}` : undefined,
                color: isTransfer ? theme.primaryColor : undefined
            }
        },
        {
            type: 'text',
            col: {
                span: 9, sm: 3, order: isPhone ? 10 : 6
            },
            cell: {
                align: 'right',
                text: saldo,
            }
        },
        {
            type: 'edit',
            col: {
                span: 3, sm: 1, order: 8
            },
            cell: {
                onEdit: () => isTransfer ?
                    openEditTransferModal({
                        title: `edit transfer #${change.data.id}`,
                        fullScreen: isPhone,
                        innerProps: {
                            transfer: change.data
                        }
                    })
                    :
                    openEditTransactionModal({
                        title: `edit transaction #${change.data.id}`,
                        fullScreen: isPhone,
                        innerProps: {
                            transaction_id: change.data.id
                        }
                    }),
            }
        },
        {
            type: 'text',
            col: {
                span: change.data.comment === '' && isPhone ? -1 : 24,
                sm: 6,
                order: isPhone ? 11 : 7
            },
            cell: {
                align: 'left',
                text: change.data.comment,
            }
        }
    ]} />
}