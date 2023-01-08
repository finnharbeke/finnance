import { Button, Grid, Text, Title } from "@mantine/core";
import { IconCirclePlus } from "@tabler/icons";
import * as moment from "moment";
import { Params, useLoaderData } from "react-router";
import { AccountChanges } from "../components/AccountChanges";
import { TransactionHead } from "../components/Transaction";
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
    transactions?: any[]
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
    const { id, desc, saldo, currency } = data;


    const date_created = moment(data.date_created);

    return <>
        <Grid justify="space-between">
            <Grid.Col span="content">
                <Title order={1}>{desc}</Title>
                <Text fz="md">Tracking since {date_created.fromNow()}</Text>
            </Grid.Col>

            <Grid.Col span="content">
                <Title order={1}>{saldo.toFixed(currency.decimals)} {currency.code}</Title>
            </Grid.Col>
        </Grid>
        <Button size="lg" my="md" fullWidth leftIcon={
            <IconCirclePlus size={40} />
        }></Button>
        <AccountChanges id={id} start={moment().startOf('M')} end={moment()}/>
    </>;
    // return <>
    //     <Title>{data.desc}</Title>
    //     <Text>{data.date_created}</Text>
    // </>

}