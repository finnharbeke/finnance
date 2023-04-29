import { Button, Divider, Grid, Title } from "@mantine/core";
import { useState } from "react";
import { CurrencyCard, CurrencyForm } from "../components/Currency";
import Placeholder from "../components/Placeholder";
import AccountList from "../components/account/AccountList";
import { openAccountModal } from "../components/account/AccountModal";
import { useCurrencies } from "../hooks/api/useQuery";
import useIsPhone from "../hooks/useIsPhone";
import { useAccounts } from "../types/Account";



export default function AccountsPage() {

    const accsQuery = useAccounts();
    const currsQuery = useCurrencies();

    const isPhone = useIsPhone();
    const [loading, setLoading] = useState(false);

    if (!accsQuery.isSuccess || !currsQuery.isSuccess)
        return <Placeholder queries={[accsQuery, currsQuery]} height={300} />

    const accounts = accsQuery.data;
    const currencies = currsQuery.data;
    return <>
        <AccountList accounts={accounts} />
        {
            accounts.length === 0 &&
            <Title order={2} align="center">no accounts yet</Title>
        }
        <Button fullWidth mt='sm' loading={loading}
            onClick={() => {
                setLoading(true);
                openAccountModal({
                    fullScreen: isPhone,
                    innerProps: {}
                }).then(() => setLoading(false))
            }}
        >
            create account</Button>
        <Divider my='sm' />
        <Title order={2} mb='xs'>currencies</Title>
        <Grid mb='sm' grow>
            {
                currencies.map((curr, i) => (
                    <Grid.Col md={4} sm={6} xs={12} key={i}>
                        <CurrencyCard currency={curr} />
                    </Grid.Col>
                ))
            }
        </Grid>
        <CurrencyForm />
    </>
}