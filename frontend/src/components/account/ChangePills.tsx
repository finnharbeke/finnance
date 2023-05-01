import { ActionIcon, Button, Center, Collapse, Group, Loader, Text, TextInput, Title, useMantineTheme } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { TbArrowsLeftRight, TbChevronLeft, TbChevronRight, TbMinus, TbPlus } from "react-icons/tb";
import { Link } from "react-router-dom";
import useAmount from "../../hooks/useAmount";
import useIsPhone from "../../hooks/useIsPhone";
import { Change, isChangeTransaction, useAccount, useChanges } from "../../types/Account";
import { DataPill } from "../DataPill";
import Placeholder from "../Placeholder";
import { openEditTransactionModal } from "../transaction/TransactionModal";
import { openEditTransferModal } from "../transfer/TransferModal";

interface FormValues {
    search: string | undefined
    startDate: Date | undefined
    endDate: Date | undefined
}

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
    const pagesize = 10;
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState<string>();
    const [start, setStart] = useState<DateTime>();
    const [end, setEnd] = useState<DateTime>();
    const [open, { toggle }] = useDisclosure(false);
    const query = useChanges(id, {
        pagesize, page, search,
        start: start?.toISO({ includeOffset: false }), end: end?.toISO({ includeOffset: false })
    });
    useEffect(() => {
        if (query.isSuccess && query.data.pages <= page)
            setPage(Math.max(query.data.pages - 1, 0))
    }, [query.isSuccess, query.data?.pages, page]);

    const form = useForm<FormValues>()

    if (query.isError)
        return <Placeholder height={pagesize * 30} queries={[query]} />

    const pages = query.data?.pages;
    const changes = query.data?.changes;

    return <>
        <ChangePills changes={changes} />
        <Group position='right'>
            <Button variant='default' onClick={toggle} size='sm'>
                filters
            </Button>
            <ActionIcon variant='default' size='lg'
                disabled={page === 0} onClick={() => setPage(page - 1)}>
                <TbChevronLeft size={24} />
            </ActionIcon>
            <ActionIcon variant='default' size='lg'
                disabled={!!pages && page === pages - 1} onClick={() => setPage(page + 1)}>
                <TbChevronRight size={24} />
            </ActionIcon>
        </Group>
        <Collapse in={open}>
            <form onSubmit={form.onSubmit(fv => {
                setSearch(fv.search);
                setStart(fv.startDate ? DateTime.fromJSDate(fv.startDate) : undefined);
                setEnd(fv.endDate ? DateTime.fromJSDate(fv.endDate) : undefined);
            })}>
                <TextInput label='search' {...form.getInputProps('search')} />
                <DateTimePicker label='min date' {...form.getInputProps('startDate')} clearable />
                <DateTimePicker label='max date' {...form.getInputProps('endDate')} clearable />
                <Button type='submit' fullWidth mt='sm'>apply</Button>
            </form>
        </Collapse >
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
                children: <Text color={color}>
                    {amount}
                </Text>
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
                children: isTransfer ?
                    <Text component={Link} color={theme.primaryColor}
                        to={`/accounts/${isSource ? change.data.dst_id : change.data.src_id}`}>
                        {change.target}
                    </Text>
                    : undefined
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