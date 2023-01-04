import { Title, Text, createStyles } from "@mantine/core";
import { useLoaderData, Params } from "react-router";
import { throwOrReturnFromResponse } from "../contexts/ErrorHandlerProvider";

interface AccountProps {
    id?: number,
    desc?: string,
    starting_saldo?: number, 
    saldo?: number, 
    date_created?: string, 
    currency?: {
        id?: number,
        code?: string,
        decimals?: number
    },
}

export function loader({ params }: { params: Params }): Promise<AccountProps> {
    if (!params.id.match(/\d+/)) {
        throw new Response("Invalid account id", { status: 400, statusText: "BAD REQUEST" });
    }
    
    return fetch(`/api/accounts/${params.id}`, {
        signal: AbortSignal.timeout(3000)
    }).then(throwOrReturnFromResponse)
}

export default function AccountPage() {
    const data: AccountProps = useLoaderData();
    const useStyles = createStyles({
        root: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 20,
        },
      });
      
    const { classes } = useStyles();
    const { desc, saldo, date_created, currency } = data;
    
    return <>
        <Title order={1}>{desc}</Title>
        <Text fz="lg">Saldo: {saldo} {currency.code}</Text>
        <Text fz="lg">Opened on: {date_created}</Text>
    </>;
    // return <>
    //     <Title>{data.desc}</Title>
    //     <Text>{data.date_created}</Text>
    // </>

}