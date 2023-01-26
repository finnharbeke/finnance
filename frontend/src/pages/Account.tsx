import { Button, Grid, Text, Title } from "@mantine/core";
import { IconCirclePlus } from "@tabler/icons";
import * as moment from "moment";
import { useState } from "react";
import { Params, useLoaderData } from "react-router";
import { AccountChanges } from "../components/AccountChanges";
import { openTransactionModal } from "../components/modals/Transaction";
import { throwOrReturnFromResponse } from "../contexts/ErrorHandlerProvider";
import { AccountDeep } from "../Types/Account";

export function loader({ params }: { params: Params }): Promise<AccountDeep> {
    if (!params.id.match(/\d+/)) {
        throw new Response("Invalid account id", { status: 400, statusText: "BAD REQUEST" });
    }

    return fetch(`/api/accounts/${params.id}`, {
        signal: AbortSignal.timeout(3000)
    }).then(throwOrReturnFromResponse)
}

export default function AccountPage() {
    const data = useLoaderData() as AccountDeep;
    const { id, desc, saldo, currency } = data;

    const [loading, setLoading] = useState(false);
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
        <Button size="lg" my="md" fullWidth loading={loading} leftIcon={
            <IconCirclePlus size={40} />
        } onClick={() => {
            setLoading(true);
            openTransactionModal({
                title: `new transaction - ${desc}`,
                innerProps: {
                    currency: currency,
                    account: data
                }
            }).then(() => setLoading(false))
        }}></Button>
        <AccountChanges id={id} start={moment().startOf('M')} end={moment()} />
    </>;
}