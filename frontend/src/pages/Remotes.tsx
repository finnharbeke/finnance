import { Button, Title } from "@mantine/core";
import { useState } from "react";
import { TbArrowWaveRightUp } from "react-icons/tb";
import { RemotePills } from "../components/transaction/TransPill";
import { openAddTransactionModal } from "../components/transaction/TransactionModal";
import useIsPhone from "../hooks/useIsPhone";

export const RemotesPage = () => {
    const [loading, setLoading] = useState(false);
    const isPhone = useIsPhone();
    return <>
        <Title>remote transactions</Title>
        <Button color='pink' size='lg' fullWidth loading={loading} my='md'
            leftIcon={<TbArrowWaveRightUp size={40} />}
            onClick={() => {
                setLoading(true);
                openAddTransactionModal({
                    fullScreen: isPhone,
                    title: 'new remote transaction',
                    innerProps: {}
                }).then(() => setLoading(false))
            }}>
            remote transaction
        </Button>
        <RemotePills />
    </>
}