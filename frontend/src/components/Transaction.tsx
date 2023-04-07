import { Box, Center, createStyles, MantineTheme, Text, Tooltip } from "@mantine/core";
import { TbMinus, TbPlus } from "react-icons/tb";
import { DateTime } from "luxon";
import { useRef } from "react";
import { useIsOverflow } from "../hooks/useIsOverflow";
import { AccountChangeTransaction } from "../Types/AccountChange";
import { integerToFixed } from "../helpers/convert";

export const HeadStyles = createStyles((theme: MantineTheme) => ({
    head: {
        background: theme.colorScheme === 'light' ?
            theme.colors['gray'][1] : theme.colors['gray'][9]
        ,
        '&:hover': {
            background: theme.colorScheme === 'light' ?
                theme.colors['gray'][2] : theme.colors['gray'][8]
        },
        borderRadius: theme.fn.radius(),
        display: 'flex',
        marginTop: 3,
        '& > *': {
            '&:first-of-type': {
                borderTopLeftRadius: theme.fn.radius(),
                borderBottomLeftRadius: theme.fn.radius(),
            },
            border: 1,
            borderColor: theme.colorScheme === 'light' ?
                theme.colors['gray'][3] : theme.colors['gray'][7],
            borderStyle: 'solid',

            '&:not(:last-of-type)': {
                borderRight: 'none',
            },
            '&:last-of-type': {
                borderTopRightRadius: theme.fn.radius(),
                borderBottomRightRadius: theme.fn.radius(),
            },
            padding: theme.spacing.xs,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            flexGrow: 0,
            flexShrink: 0,
        }
    },
    child: {
    },
    transferIcon: {
        background: theme.colors.violet[
            theme.colorScheme === 'light' ? 3 : 6
        ],
    },
    incomeIcon: {
        background: theme.colors.blue[
            theme.colorScheme === 'light' ? 3 : 6
        ],
    },
    expenseIcon: {
        background: theme.colors.red[
            theme.colorScheme === 'light' ? 3 : 6
        ],
    },
    date: {
        flexBasis: 69 + 2 * 8 + 2,
        textAlign: 'center'
    },
    time: {
        flexBasis: 45 + 2 * 8 + 2,
        textAlign: 'center'
    },
    amount: {
        flexBasis: 64 + 2 * 8 + 2,
        textAlign: 'right',
    },
    incomeAmount: {
        color: theme.colors.blue[
            theme.colorScheme === 'light' ? 3 : 6
        ],
    },
    expenseAmount: {
        color: theme.colors.red[
            theme.colorScheme === 'light' ? 3 : 6
        ],
    },
    other: {
        flexBasis: '25%',
        color: theme.colors[theme.primaryColor][
            theme.colorScheme === 'light' ? 4 : 6
        ]
    },
    agent: {
        flexBasis: '25%'
    },
    comment: {
        flex: 'auto',
    }
}));

export function TransactionHead({ saldo, data }: AccountChangeTransaction) {
    const { classes, cx } = HeadStyles();

    const { is_expense, comment, amount, agent, currency } = data;

    const date = DateTime.fromISO(data.date_issued);

    const agentRef = useRef<HTMLDivElement>(null);
    const agentOverflow = useIsOverflow(agentRef);
    const commentRef = useRef<HTMLDivElement>(null);
    const commentOverflow = useIsOverflow(commentRef);
    const amountRef = useRef<HTMLDivElement>(null);
    const amountOverflow = useIsOverflow(amountRef);
    const saldoRef = useRef<HTMLDivElement>(null);
    const saldoOverflow = useIsOverflow(saldoRef);

    return <>
        <Box className={classes.head}>
            <Center className={cx(classes.child, is_expense ? classes.expenseIcon : classes.incomeIcon)}>
                {is_expense ? <TbMinus size={18} /> : <TbPlus size={18} />}
            </Center>
            <Text className={cx(classes.child, classes.date)}>{date.toFormat("dd.MM.yy")}</Text>
            <Text className={cx(classes.child, classes.time)}>{date.toFormat("HH:mm")}</Text>
            <Tooltip label={integerToFixed(amount, currency)} disabled={!amountOverflow} openDelay={250}>
                <Text className={cx(classes.child, classes.amount,
                    is_expense ? classes.expenseAmount : classes.incomeAmount)}
                    ref={amountRef}>
                    {integerToFixed(amount, currency)}
                </Text>
            </Tooltip>
            <Tooltip label={agent.desc} disabled={!agentOverflow} openDelay={250}>
                <Text className={cx(classes.child, classes.agent)} ref={agentRef}>{agent.desc}</Text>
            </Tooltip>
            <Tooltip label={integerToFixed(saldo, currency)} disabled={!saldoOverflow} openDelay={250}>
                <Text className={cx(classes.child, classes.amount)} ref={saldoRef}>
                {integerToFixed(saldo, currency)}
                </Text>
            </Tooltip>
            <Tooltip label={comment} disabled={!commentOverflow} openDelay={250}>
                <Text className={cx(classes.child, classes.comment)} ref={commentRef}>{comment}</Text>
            </Tooltip>
        </Box>
    </>

}