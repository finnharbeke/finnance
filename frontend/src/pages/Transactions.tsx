import { Button, Title } from "@mantine/core";
import { useState } from "react";
import { TbCirclePlus } from "react-icons/tb";
import { FilterableTransactions } from "../components/transaction/TransPill";
import { addTransactionAction } from "../actions/actions";

export const TransactionsPage = () => {
    const [loading, setLoading] = useState(false);
    return <>
        <Title>all transactions</Title>
        <Button size='lg' fullWidth loading={loading} my='md'
            leftSection={<TbCirclePlus size={40} />}
            onClick={() => {
                setLoading(true);
                addTransactionAction({}).then(
                    () => setLoading(false)
                )
            }}>
            new transaction
        </Button>
        <FilterableTransactions />
    </>
}