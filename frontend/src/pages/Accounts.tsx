import { Center, Loader } from "@mantine/core";
import { DateTime } from "luxon";
import AccountInfos from "../components/AccountInfos";
import { useAccounts } from "../hooks/useQuery";



export default function AccountsPage() {

    const { data, isSuccess, isLoading, isError } = useAccounts();

    if (isSuccess)
        return <>{
            data.map((acc, i) => <AccountInfos data={acc} ix={i} key={i} />)
        }
            <AccountInfos data={{
                id: 1, date_created: DateTime.now().toISO(),
                user_id: 1,
                order: 1,
                desc: "account desc",
                starting_saldo: 0,
                currency_id: 1,
                color: "#ff0000",
                saldo: 0,
                type: "account",
                currency: {
                    id: 1,
                    code: "CHF",
                    decimals: 2,
                    type: "currency"
                },
                user: {
                    id: 1,
                    username: "test",
                    email: "test@somewhere.com",
                }
            }} ix={data.length}/>
        </>
    if (isLoading)
        return <Center><Loader size='lg' /></Center>
    if (isError)
        return <>Error</>

}