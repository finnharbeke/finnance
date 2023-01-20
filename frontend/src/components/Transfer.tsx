import { Box, Center, createStyles, Text, Tooltip, useMantineTheme } from "@mantine/core";
import { IconArrowsLeftRight, IconMinus, IconPlus } from "@tabler/icons";
import * as moment from "moment";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useIsOverflow } from "../hooks/useIsOverflow";
import { AccountChangeTransfer } from "../Types/AccountChange";
import { HeadStyles } from "./Transaction";

export function TransferHead(props: AccountChangeTransfer) {
    
    const { classes, cx } = HeadStyles();

    const { saldo, acc_id } = props;
    const { src, dst, comment, src_amount, dst_amount } = props.data;
    const is_expense = src.id === acc_id;
    const amount = is_expense ? src_amount : dst_amount;
    const acc = is_expense ? src : dst;
    const other = is_expense ? dst : src;

    const date = moment(props.data.date_issued);

    const otherRef = useRef();
    const otherOverflow = useIsOverflow(otherRef);
    const commentRef = useRef();
    const commentOverflow = useIsOverflow(commentRef);

    return <>
        <Box className={classes.head}>
            <Center className={cx(classes.child, classes.transferIcon)}>
                <IconArrowsLeftRight />
            </Center>
            <Text className={cx(classes.child, classes.date)}>{date.format("DD.MM.YY")}</Text>
            <Text className={cx(classes.child, classes.time)}>{date.format("HH:mm")}</Text>
            <Text className={cx(classes.child, classes.amount,
                is_expense ? classes.expenseAmount : classes.incomeAmount)}>{amount.toFixed(2)}</Text>
            <Tooltip label={other.desc} disabled={!otherOverflow} openDelay={250}>
                <Text className={cx(classes.child, classes.other)} ref={otherRef}>
                    <Text component={Link} to={`/accounts/${other.id}`} >
                    {other.desc}
                    </Text>
                </Text>
            </Tooltip>
            <Text className={cx(classes.child, classes.amount)}>{saldo.toFixed(2)}</Text>
            <Tooltip label={comment} disabled={!commentOverflow} openDelay={250}>
                <Text className={cx(classes.child, classes.comment)} ref={commentRef}>{comment}</Text>
            </Tooltip>
        </Box>
    </>

}