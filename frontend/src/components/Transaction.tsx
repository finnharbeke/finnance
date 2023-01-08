import { Box, Center, createStyles, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons";
import * as moment from "moment";
import { useRef } from "react";
import { useIsOverflow } from "../hooks/useIsOverflow";
import { AccountChangeTransaction } from "../Types/AccountChange";
import { TransactionDeep } from "../Types/Transaction";

export function TransactionHead(props: AccountChangeTransaction) {
    const theme = useMantineTheme();
    const incomeColor = theme.colors.blue[
        theme.colorScheme === 'light' ? 3 : 6
    ];
    const expenseColor = theme.colors.cinnabar[
        theme.colorScheme === 'light' ? 3 : 6
    ];
    const radius = theme.fn.radius();
    const useStyles = createStyles({
        head: {
            background: theme.colorScheme === 'light' ?
                theme.colors['gray'][1] : theme.colors['gray'][9]
            ,
            '&:hover': {
                background: theme.colorScheme === 'light' ?
                    theme.colors['gray'][2] : theme.colors['gray'][8]
            },
            borderRadius: radius,
            display: 'flex',
            // marginTop: 3,
            '& > *': {
                '&:first-of-type': {
                    borderTopLeftRadius: radius,
                    borderBottomLeftRadius: radius,
                },
                border: 1,
                borderColor: theme.colorScheme === 'light' ?
                    theme.colors['gray'][3] : theme.colors['gray'][7],
                borderStyle: 'solid',
    
                '&:not(:last-of-type)': {
                    borderRight: 'none',
                },
                '&:last-of-type': {
                    borderTopRightRadius: radius,
                    borderBottomRightRadius: radius,
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
        incomeIcon: {
            background: incomeColor,
        },
        expenseIcon: {
            background: expenseColor,
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
            color: incomeColor,
        },
        expenseAmount: {
            color: expenseColor,
        },
        agent: {
            flexBasis: '25%'
        },
        comment: {
            flex: 'auto',
        }
    });
    const { classes, cx } = useStyles();

    const { saldo } = props;
    const { is_expense, comment, amount, agent, currency } = props.data;

    const date = moment(props.data.date_issued);

    const agentRef = useRef();
    const agentOverflow = useIsOverflow(agentRef);
    const commentRef = useRef();
    const commentOverflow = useIsOverflow(commentRef);

    return <>
        <Box className={classes.head}>
            <Center className={cx(classes.child, is_expense ? classes.expenseIcon : classes.incomeIcon)}>
                {is_expense ? <IconMinus /> : <IconPlus />}
            </Center>
            <Text className={cx(classes.child, classes.date)}>{date.format("DD.MM.YY")}</Text>
            <Text className={cx(classes.child, classes.time)}>{date.format("HH:mm")}</Text>
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