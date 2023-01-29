import { Box, Center, createStyles, MantineTheme, Text, Tooltip } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons";
import { DateTime } from "luxon";
import { useRef } from "react";
import { useIsOverflow } from "../hooks/useIsOverflow";
import { AccountChangeTransaction } from "../Types/AccountChange";

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
        flexBasis: 69 + 2 * theme.spacing.xs + 2,
        textAlign: 'center'
    },
    time: {
        flexBasis: 45 + 2 * theme.spacing.xs + 2,
        textAlign: 'center'
    },
    amount: {
        flexBasis: 64 + 2 * theme.spacing.xs + 2,
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
        flexBasis: '25%'
    },
    agent: {
        flexBasis: '25%'
    },
    comment: {
        flex: 'auto',
    }
}));

export function TransactionHead(props: AccountChangeTransaction) {
    const { classes, cx } = HeadStyles();

    const { saldo } = props;
    const { is_expense, comment, amount, agent, currency } = props.data;

    const date = DateTime.fromISO(props.data.date_issued);

    const agentRef = useRef();
    const agentOverflow = useIsOverflow(agentRef);
    const commentRef = useRef();
    const commentOverflow = useIsOverflow(commentRef);

    return <>
        <Box className={classes.head}>
            <Center className={cx(classes.child, is_expense ? classes.expenseIcon : classes.incomeIcon)}>
                {is_expense ? <IconMinus /> : <IconPlus />}
            </Center>
            <Text className={cx(classes.child, classes.date)}>{date.toFormat("dd.MM.yy")}</Text>
            <Text className={cx(classes.child, classes.time)}>{date.toFormat("HH:mm")}</Text>
            <Text className={cx(classes.child, classes.amount,
                is_expense ? classes.expenseAmount : classes.incomeAmount)}>{amount.toFixed(currency.decimals)}</Text>
            <Tooltip label={agent.desc} disabled={!agentOverflow} openDelay={250}>
                <Text className={cx(classes.child, classes.agent)} ref={agentRef}>{agent.desc}</Text>
            </Tooltip>
            <Text className={cx(classes.child, classes.amount)}>{saldo.toFixed(currency.decimals)}</Text>
            <Tooltip label={comment} disabled={!commentOverflow} openDelay={250}>
                <Text className={cx(classes.child, classes.comment)} ref={commentRef}>{comment}</Text>
            </Tooltip>
        </Box>
    </>

}