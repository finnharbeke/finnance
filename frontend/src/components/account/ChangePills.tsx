import { ActionIcon, Button, Center, Collapse, Flex, Grid, Group, Popover, Text, TextInput, Title, Tooltip, createStyles, useMantineTheme } from "@mantine/core";
import { DateTime, Duration } from "luxon";
import { ReactNode, useEffect, useRef, useState } from "react";
import { TbArrowsLeftRight, TbChevronLeft, TbChevronRight, TbMinus, TbPlus } from "react-icons/tb";
import { Link } from "react-router-dom";
import { AccountChange, isAccountChangeTransaction } from "../../Types/AccountChange";
import { integerToFixed } from "../../helpers/convert";
import { useAccount, useChanges } from "../../hooks/api/useQuery";
import { useIsOverflow } from "../../hooks/useIsOverflow";
import useIsPhone from "../../hooks/useIsPhone";
import Placeholder from "../Placeholder";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import DateTimeInput from "../DateTimeInput";
import { _TransformValues } from "@mantine/form/lib/types";
import { DateTimePicker } from "@mantine/dates";

interface FormValues {
    search: string | undefined
    startDate: Date | undefined
    endDate: Date | undefined
}

export function ChangePills({ id }: { id: number }) {
    const pagesize = 10;
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState<string>();
    const [start, setStart] = useState<DateTime>();
    const [end, setEnd] = useState<DateTime>();
    const [open, { toggle }] = useDisclosure(false);
    const query = useChanges(id, { pagesize, page, search, start, end });
    useEffect(() => {
        if (query.isSuccess && query.data.pages <= page)
            setPage(query.data.pages - 1)
    }, [query.data?.pages, page]);

    const form = useForm<FormValues>()

    if (!query.isSuccess)
        return <Placeholder height={pagesize * 30} queries={[]} />

    const { pages, changes } = query.data;

    return <>
        {
            changes.length > 0 ?
            changes.map((change, ix) =>
                <ChangePill change={change} key={ix} />
            )
            :
            <Title order={4} align='center'>no changes found</Title>
        }
        <Group position='right'>
            <Button variant='default' onClick={toggle} size='sm'>
                filters
            </Button>
            <ActionIcon variant='default' size='lg'
                disabled={page === 0} onClick={() => setPage(page - 1)}>
                <TbChevronLeft size={24} />
            </ActionIcon>
            <ActionIcon variant='default' size='lg'
                disabled={page === pages - 1} onClick={() => setPage(page + 1)}>
                <TbChevronRight size={24} />
            </ActionIcon>
        </Group>
        <Collapse in={open}>
            <form onSubmit={form.onSubmit(fv => {
                setSearch(fv.search);
                setStart(fv.startDate ? DateTime.fromJSDate(fv.startDate) : undefined);
                setEnd(fv.endDate ? DateTime.fromJSDate(fv.endDate) : undefined);
            })}>
            <TextInput label='search' {...form.getInputProps('search')}/>
            <DateTimePicker label='min date' {...form.getInputProps('startDate')} clearable/> 
            <DateTimePicker label='max date' {...form.getInputProps('endDate')} clearable/> 
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

const ChangePill = ({ change }: { change: AccountChange }) => {
    const theme = useMantineTheme();
    const { classes, cx } = useStyles();
    const isPhone = useIsPhone();

    const query = useAccount(change.acc_id);

    const amountRef = useRef<HTMLDivElement>(null);
    const amountOverflow = useIsOverflow(amountRef);
    const agentRef = useRef<HTMLDivElement>(null);
    const agentOverflow = useIsOverflow(agentRef);
    const saldoRef = useRef<HTMLDivElement>(null);
    const saldoOverflow = useIsOverflow(saldoRef);
    const commentRef = useRef<HTMLDivElement>(null);
    const commentOverflow = useIsOverflow(commentRef);

    if (!query.isSuccess)
        return <Placeholder height={30} queries={[query]} />

    const account = query.data;
    const isTransfer = !isAccountChangeTransaction(change);
    const isSource = isTransfer && change.data.src_id === change.acc_id;
    const isExpense = (!isTransfer && change.data.is_expense) || isSource;
    const date = DateTime.fromISO(change.data.date_issued);

    const agent = isTransfer ?
        (isSource ? change.data.dst : change.data.src) : change.data.agent;

    const iconColor = theme.colors[
        isTransfer ? 'grape' : isExpense ? 'red' : 'blue'
    ][
        theme.colorScheme === 'light' ? 3 : 6
    ];
    const color = theme.colors[
        isExpense ? 'red' : 'blue'
    ][
        theme.colorScheme === 'light' ? 4 : 6
    ];;

    const amount = isTransfer ?
        isSource ? change.data.src_amount : change.data.dst_amount
        : change.data.amount;

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
                label={integerToFixed(amount, account.currency)}
                popover={
                    <Text color={color}
                        className={classes.amount}>
                        {integerToFixed(amount, account.currency)}
                    </Text>
                }>
                <Text color={color} ref={amountRef}
                    className={cx(classes.ellipsis, classes.amount)}>
                    {integerToFixed(amount, account.currency)}
                </Text>
            </PopoverOrTooltip>
        </Center></Grid.Col>
        <Grid.Col span={15} sm={6}><Flex align='center'>
            <PopoverOrTooltip label={agent.desc} multiline width={250}
                overflow={agentOverflow} popover={
                    <Text>
                        {agent.desc}
                    </Text>
                }>
                {
                    isTransfer ?
                        <Text className={classes.ellipsis} ref={agentRef}>
                            <Text component={Link} to={`/accounts/${agent.id}`} color={theme.primaryColor} >
                                {agent.desc}
                            </Text>
                        </Text>
                        :
                        <Text ref={agentRef}
                            className={classes.ellipsis}>
                            {agent.desc}
                        </Text>
                }
            </PopoverOrTooltip>
        </Flex></Grid.Col>
        <Grid.Col span={9} sm={3}><Center>
            <PopoverOrTooltip label={integerToFixed(change.saldo, account.currency)}
                overflow={saldoOverflow} popover={
                    <Text className={classes.amount}>
                        {integerToFixed(change.saldo, account.currency)}
                    </Text>
                }>
                <Text ref={saldoRef}
                    className={cx(classes.ellipsis, classes.amount)}>
                    {integerToFixed(change.saldo, account.currency)}
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