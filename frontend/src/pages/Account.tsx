import { Button, Center, Grid, Loader, Text, Title } from "@mantine/core";
import { DateTime } from "luxon";
import { useState } from "react";
import { TbCirclePlus } from "react-icons/tb";
import { useParams } from "react-router";
import { AccountChanges } from "../components/account/AccountChanges";
import { openTransactionModal } from "../components/modals/TransactionModal";
import { integerToFixed } from "../helpers/convert";
import { useAccount } from "../hooks/api/useQuery";
import useIsPhone from "../hooks/useIsPhone";
import NotFound from "./404";

export default function AccountPage() {
    const params = useParams();
    const { data, isLoading, isError, error } = useAccount(parseInt(params.id as string));
    const [loading, setLoading] = useState(false);
    const date_created = DateTime.fromISO(data?.date_created as string);

    const isPhone = useIsPhone();

    if (!params.id?.match(/\d+/) || (isError && error.status === 404))
        return <NotFound/>
    if (isLoading)
        return <Center><Loader size='lg' /></Center>
    else if (isError)
        return <Center><Title>error</Title></Center>
    return <>
        <Grid justify="space-between">
            <Grid.Col span="content">
                <Title order={1}>{data.desc}</Title>
                <Text fz="md">Tracking since {date_created.toRelative()}</Text>
            </Grid.Col>

            <Grid.Col span="content">
                <Title order={1}>{integerToFixed(data.saldo, data.currency)} {data.currency.code}</Title>
            </Grid.Col>
        </Grid>
        <Button size="lg" my="md" fullWidth loading={loading} leftIcon={
            <TbCirclePlus size={40} />
        } onClick={() => {
            setLoading(true);
            openTransactionModal({
                title: `new transaction - ${data.desc}`,
                fullScreen: isPhone,
                innerProps: {
                    account: data
                }
            }).then(() => setLoading(false))
        }}/>
        <AccountChanges id={data?.id as number} n={10} />
    </>;
}