import { Button, Title } from "@mantine/core";
import { useState } from "react";
import { TbArrowWaveRightUp } from "react-icons/tb";
import { addTransactionAction } from "../actions/actions";
import { FilterableTransactions } from "../components/transaction/TransPill";

export const RemotesPage = () => {
    const [loading, setLoading] = useState(false);
    return <>
        <Title>remote transactions</Title>
        <Button color='pink' size='lg' fullWidth loading={loading} my='md'
            leftSection={<TbArrowWaveRightUp size={40} />}
            onClick={() => {
                setLoading(true);
                addTransactionAction({ remote: true }).then(
                    () => setLoading(false)
                )
            }}>
            remote transaction
        </Button>
        <FilterableTransactions account_id={null} />
    </>
}