import { Button, Center, Divider, Grid, Loader, Title } from "@mantine/core";
import { useState } from "react";
import { CurrencyCard, CurrencyForm } from "../components/Currency";
import AccountList from "../components/account/AccountList";
import { openAccountModal } from "../components/account/AccountModal";
import { useAccounts, useCurrencies } from "../hooks/api/useQuery";
import useIsPhone from "../hooks/useIsPhone";



export default function AccountsPage() {

    const { data: accounts, isSuccess: successAccs, isLoading: loadingAccs } = useAccounts();
    const { data: currencies, isSuccess: successCurrs, isLoading: loadingCurrs } = useCurrencies();

    const isPhone = useIsPhone();
    const [loading, setLoading] = useState(false);

    if (successAccs && successCurrs)
        return <>
            <AccountList accounts={accounts}/>
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
            <Divider my='sm'/>
            <Title order={2} mb='xs'>currencies</Title>
            <Grid mb='sm' grow>
                {
                    currencies.map((curr, i) =>(
                        <Grid.Col md={4} sm={6} xs={12} key={i}>
                            <CurrencyCard currency={curr}/>
                        </Grid.Col>
                    ))
                }
            </Grid>
            <CurrencyForm/>
        </>
    if (loadingAccs || loadingCurrs)
        return <Center><Loader size='lg' /></Center>
    return <>Error</>
}