import { Button, Grid, Skeleton, Text, Title } from "@mantine/core";
import { TbCirclePlus } from "react-icons/tb";
import { DateTime } from "luxon";
import { useState } from "react";
import { useParams } from "react-router";
import { AccountChanges } from "../components/AccountChanges";
import { openTransactionModal } from "../components/modals/Transaction";
import { useAccount } from "../hooks/useQuery";

export default function AccountPage() {
    const params = useParams();
    if (!params.id?.match(/\d+/)) {
        throw new Response("Invalid account id", { status: 400, statusText: "BAD REQUEST" });
    }

    const { data, isLoading } = useAccount(parseInt(params.id))

    const [loading, setLoading] = useState(false);
    const date_created = DateTime.fromISO(data?.date_created);

    if (isLoading)
        return <Skeleton height={200}></Skeleton>
    return <>
        <Grid justify="space-between">
            <Grid.Col span="content">
                <Title order={1}>{data?.desc}</Title>
                <Text fz="md">Tracking since {date_created.toRelative()}</Text>
            </Grid.Col>

            <Grid.Col span="content">
                <Title order={1}>{data?.saldo.toFixed(data?.currency.decimals)} {data?.currency.code}</Title>
            </Grid.Col>
        </Grid>
        <Button size="lg" my="md" fullWidth loading={loading} leftIcon={
            <TbCirclePlus size={40} />
        } onClick={() => {
            setLoading(true);
            openTransactionModal({
                title: `new transaction - ${data?.desc}`,
                innerProps: {
                    currency: data?.currency,
                    account: data
                }
            }).then(() => setLoading(false))
        }}></Button>
        <AccountChanges id={data?.id} n={10} />
    </>;
}