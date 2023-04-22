import { Box, Center, Text, Tooltip } from "@mantine/core";
import { TbArrowsLeftRight } from "react-icons/tb";
import { DateTime } from "luxon";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useIsOverflow } from "../../hooks/useIsOverflow";
import { AccountChangeTransfer } from "../../Types/AccountChange";
import { HeadStyles } from "../Transaction";
import { integerToFixed } from "../../helpers/convert";
import { useCurrencies } from "../../hooks/api/useQuery";
import findId from "../../helpers/findId";

export function TransferHead(props: AccountChangeTransfer) {

    const { classes, cx } = HeadStyles();
    const { data: currencies, isSuccess } = useCurrencies();

    const { saldo, acc_id } = props;
    const { src, dst, comment, src_amount, dst_amount } = props.data;
    const is_expense = src.id === acc_id;
    const amount = is_expense ? src_amount : dst_amount;
    // const acc = is_expense ? src : dst;
    const other = is_expense ? dst : src;

    const date = DateTime.fromISO(props.data.date_issued);

    const otherRef = useRef<HTMLDivElement>(null);
    const otherOverflow = useIsOverflow(otherRef);
    const commentRef = useRef<HTMLDivElement>(null);
    const commentOverflow = useIsOverflow(commentRef);

    if (!isSuccess)
        return <Box className={classes.head}>Error</Box>
    const currency = findId(currencies, is_expense ? src.currency_id : dst.currency_id);
    if (!currency)
        return <Box className={classes.head}>Error</Box>
    return <Box className={classes.head}>
        <Center className={cx(classes.child, classes.transferIcon)}>
            <TbArrowsLeftRight size={18} />
        </Center>
        <Text className={cx(classes.child, classes.date)}>{date.toFormat("dd.MM.yy")}</Text>
        <Text className={cx(classes.child, classes.time)}>{date.toFormat("HH:mm")}</Text>
        <Text className={cx(classes.child, classes.amount,
            is_expense ? classes.expenseAmount : classes.incomeAmount)}>{integerToFixed(amount, currency)}</Text>
        <Tooltip label={other.desc} disabled={!otherOverflow} openDelay={250}>
            <Text className={cx(classes.child, classes.other)} ref={otherRef}>
                <Text component={Link} to={`/accounts/${other.id}`} >
                    {other.desc}
                </Text>
            </Text>
        </Tooltip>
        <Text className={cx(classes.child, classes.amount)}>{integerToFixed(saldo, currency)}</Text>
        <Tooltip label={comment} disabled={!commentOverflow} openDelay={250}>
            <Text className={cx(classes.child, classes.comment)} ref={commentRef}>{comment}</Text>
        </Tooltip>
    </Box>

}