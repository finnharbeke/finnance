import { Center, Flex, Grid, Popover, Text, Tooltip, createStyles, useMantineTheme } from "@mantine/core";
import { DateTime } from "luxon";
import { TbArrowsLeftRight, TbMinus, TbPlus } from "react-icons/tb";
import { AccountChange, isAccountChangeTransaction } from "../../Types/AccountChange";
import { integerToFixed } from "../../helpers/convert";
import { useAccount, useChanges } from "../../hooks/api/useQuery";
import Placeholder from "../Placeholder";
import { useIsOverflow } from "../../hooks/useIsOverflow";
import { ReactNode, useRef } from "react";
import useIsPhone from "../../hooks/useIsPhone";
import { Link } from "react-router-dom";

export function ChangePills({ id, n }: { id: number, n: number }) {
    const query = useChanges(id, { n });
    if (!query.isSuccess)
        return <Placeholder height={n * 30} queries={[]} />

    const changes = query.data;
    return <>{
        changes.map((change, ix) =>
            <ChangePill change={change} key={ix} />
            // isAccountChangeTransaction(change) ?
            //     <TransactionHead {...change} key={ix} />
            //     :
            //     <TransferHead {...change} key={ix} />
        )
    }</>
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
                    <Text color={color}
                        className={classes.amount}>
                        {integerToFixed(change.saldo, account.currency)}
                    </Text>
                }>
                <Text color={color} ref={saldoRef}
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