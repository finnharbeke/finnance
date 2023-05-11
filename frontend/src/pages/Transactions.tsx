import { Button, Title } from "@mantine/core";
import { useState } from "react";
import { TbCirclePlus } from "react-icons/tb";
import { FilterableTransactions } from "../components/transaction/TransPill";
import { openAddTransactionModal } from "../components/transaction/TransactionModal";
import useIsPhone from "../hooks/useIsPhone";

export const TransactionsPage = () => {
    const [loading, setLoading] = useState(false);
    const isPhone = useIsPhone();
    return <>
        <Title>all transactions</Title>
        <Button size='lg' fullWidth loading={loading} my='md'
            leftIcon={<TbCirclePlus size={40} />}
            onClick={() => {
                setLoading(true);
                openAddTransactionModal({
                    fullScreen: isPhone,
                    title: 'new transaction',
                    innerProps: {}
                }).then(() => setLoading(false))
            }}>
            new transaction
        </Button>
        <FilterableTransactions />
    </>
}