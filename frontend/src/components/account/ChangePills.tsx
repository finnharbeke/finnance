import { ActionIcon, Button, Center, Collapse, Flex, Grid, Group, Loader, Popover, Text, TextInput, Title, Tooltip, createStyles, useMantineTheme } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { DateTime } from "luxon";
import { ReactNode, useEffect, useRef, useState } from "react";
import { TbArrowsLeftRight, TbChevronLeft, TbChevronRight, TbMinus, TbPlus } from "react-icons/tb";
import { Link } from "react-router-dom";
import { Change, isChangeTransaction } from "../../types/Account";
import { useAccount, useChanges } from "../../hooks/api/useQuery";
import { useIsOverflow } from "../../hooks/useIsOverflow";
import useIsPhone from "../../hooks/useIsPhone";
import Placeholder from "../Placeholder";
import useAmount from "../../hooks/useAmount";

interface FormValues {
    search: string | undefined
    startDate: Date | undefined
    endDate: Date | undefined
}

export function ChangePills({ changes }: { changes: Change[] | undefined }) {
    if (changes === undefined)
        return <Center><Loader/></Center>
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
    const query = useChanges(id, { pagesize, page, search,
        start: start?.toISO({ includeOffset: false }), end: end?.toISO({ includeOffset: false }) });
    useEffect(() => {
        if (query.isSuccess && query.data.pages <= page)
            setPage(Math.max(query.data.pages - 1, 0))
    }, [query.isSuccess, query.data?.pages, page]);

    const form = useForm<FormValues>()

    if (query.isError)
        return <Placeholder height={pagesize * 30} queries={[]} />

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

const useStyles = createStyles(theme => ({
    pill: {
        backgroundColor: theme.colorScheme === 'light' ?
            theme.colors['gray'][1] : theme.colors['gray'][8],
        marginLeft: 0,
        marginRight: 0,
        borderRadius: theme.fn.radius(),
        '& > * > *': {
            height: '2rem',
            paddingLeft: theme.spacing.xs,
            paddingRight: theme.spacing.xs,
            borderRadius: theme.fn.radius(),
            backgroundColor: theme.colorScheme === 'light' ?
                theme.white : theme.colors['gray'][9],
        }
    },
    ellipsis: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    amount: {
        textAlign: 'right',
        width: '100%'
    }
}))

interface PopoverOrTooltipProps {
    label: string
    children: ReactNode
    overflow: boolean
    popover: ReactNode
    multiline?: boolean
    width?: number
}

const PopoverOrTooltip = ({ label, children, overflow, multiline, width, popover }: PopoverOrTooltipProps) => {
    const isPhone = useIsPhone();
    return isPhone ?
        <Popover disabled={!overflow} width={width}>
            <Popover.Target>
                {children}
            </Popover.Target>
            <Popover.Dropdown>
                {popover}
            </Popover.Dropdown>
        </Popover>
        :
        <Tooltip label={label} multiline={multiline}
            width={width} disabled={!overflow}>
            {children}
        </Tooltip>

}

const ChangePill = ({ change }: { change: Change }) => {
    const theme = useMantineTheme();
    const { classes, cx } = useStyles();
    const isPhone = useIsPhone();

    const query = useAccount(change.acc_id);
    const isTransfer = !isChangeTransaction(change);
    const isSource = isTransfer && change.data.src_id === change.acc_id;
    const isExpense = (!isTransfer && change.data.is_expense) || isSource;

    const amountRef = useRef<HTMLDivElement>(null);
    const amountOverflow = useIsOverflow(amountRef);
    const agentRef = useRef<HTMLDivElement>(null);
    const agentOverflow = useIsOverflow(agentRef);
    const saldoRef = useRef<HTMLDivElement>(null);
    const saldoOverflow = useIsOverflow(saldoRef);
    const commentRef = useRef<HTMLDivElement>(null);
    const commentOverflow = useIsOverflow(commentRef);

    const amount = useAmount(isTransfer ? 
        isSource ? change.data.src_amount : change.data.dst_amount
        : change.data.amount, query.data?.currency)
    
    const saldo = useAmount(query.data?.saldo, query.data?.currency);

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

    const gutter = 2;
    return <Grid gutter={gutter} p={gutter / 2} columns={24}
        mb={isPhone ? 'sm' : 'xs'} className={classes.pill}>
        <Grid.Col span={3} sm={1}><Center style={{
            backgroundColor: iconColor
        }}>
            {
                isTransfer ?
                    <TbArrowsLeftRight size={24} />
                    :
                    isExpense ?
                        <TbMinus size={24} />
                        :
                        <TbPlus size={24} />
            }
        </Center></Grid.Col>
        <Grid.Col span={7} sm={3}><Center>
            <Text>{date.toFormat('dd.MM.yy')}</Text>
        </Center></Grid.Col>
        <Grid.Col span={5} sm={2}><Center>
            <Text>{date.toFormat('HH:mm')}</Text>
        </Center></Grid.Col>
        <Grid.Col span={9} sm={2}><Center>
            <PopoverOrTooltip overflow={amountOverflow}
                label={amount}
                popover={
                    <Text color={color}
                        className={classes.amount}>
                        {amount}
                    </Text>
                }>
                <Text color={color} ref={amountRef}
                    className={cx(classes.ellipsis, classes.amount)}>
                    {amount}
                </Text>
            </PopoverOrTooltip>
        </Center></Grid.Col>
        <Grid.Col span={15} sm={6}><Flex align='center'>
            <PopoverOrTooltip label={change.target} multiline width={250}
                overflow={agentOverflow} popover={
                    <Text>{change.target}</Text>
                }>
                {
                    isTransfer ?
                        <Text className={classes.ellipsis} ref={agentRef}>
                            <Text component={Link} color={theme.primaryColor}
                                to={`/accounts/${isSource ? change.data.dst_id : change.data.src_id}`}>
                                {change.target}
                            </Text>
                        </Text>
                        :
                        <Text ref={agentRef} className={classes.ellipsis}>
                            {change.target}
                        </Text>
                }
            </PopoverOrTooltip>
        </Flex></Grid.Col>
        <Grid.Col span={9} sm={3}><Center>
            <PopoverOrTooltip label={saldo}
                overflow={saldoOverflow} popover={
                    <Text className={classes.amount}>{saldo}</Text>
                }>
                <Text ref={saldoRef}
                    className={cx(classes.ellipsis, classes.amount)}>
                    {saldo}
                </Text>
            </PopoverOrTooltip>
        </Center></Grid.Col>
        {
            (change.data.comment !== '' || !isPhone) &&
            <Grid.Col span={24} sm={7}><Flex align='center'>
                <PopoverOrTooltip label={change.data.comment} multiline width={250}
                    overflow={commentOverflow} popover={
                        <Text>
                            {change.data.comment}
                        </Text>
                    }>
                    <Text ref={commentRef}
                        className={classes.ellipsis}>
                        {change.data.comment}
                    </Text>
                </PopoverOrTooltip>
            </Flex></Grid.Col>
        }
    </Grid >
}