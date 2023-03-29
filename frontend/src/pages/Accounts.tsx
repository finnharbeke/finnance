import { Center, Divider, Grid, Loader, Title } from "@mantine/core";
import AccountFormList from "../components/account/AccountFormList";
import { CurrencyCard, CurrencyForm } from "../components/Currency";
import { useAccounts, useCurrencies } from "../hooks/useQuery";



export default function AccountsPage() {

    const { data: accounts, isSuccess: successAccs, isLoading: loadingAccs, isError: errorAccs } = useAccounts();
    const { data: currencies, isSuccess: successCurrs, isLoading: loadingCurrs, isError: errorCurrs } = useCurrencies();



    if (successAccs && successCurrs)
        return <>
            <Title order={1} mb='sm'>accounts</Title>
            <AccountFormList accounts={accounts}/>
            {
                accounts.length === 0 &&
                
                <Title order={2} align="center">no accounts yet</Title>
            }
            <Divider my='sm'/>
            <Title order={2} mb='xs'>currencies</Title>
            <Grid mb='sm'>
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
    if (loadingAccs || loadingCurrs)
        return <Center><Loader size='lg' /></Center>
    if (errorAccs || errorCurrs)
        return <>Error</>

}