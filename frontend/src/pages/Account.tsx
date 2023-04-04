import { Button, Center, Grid, Loader, Text, Title, useMantineTheme } from "@mantine/core";
import { DateTime } from "luxon";
import { useState } from "react";
import { TbCirclePlus } from "react-icons/tb";
import { useParams } from "react-router";
import { AccountChanges } from "../components/account/AccountChanges";
import { openTransactionModal } from "../components/modals/Transaction";
import { useAccount } from "../hooks/api/useQuery";
import NotFound from "./404";
import { useMediaQuery } from "@mantine/hooks";

export default function AccountPage() {
    const theme = useMantineTheme()
    const params = useParams();
    const { data, isLoading, isError, error } = useAccount(parseInt(params.id as string));
    const [loading, setLoading] = useState(false);
    const date_created = DateTime.fromISO(data?.date_created as string);

    const isPhone = useMediaQuery(theme.fn.smallerThan('xs').replace('@media ', ''));

    if (!params.id?.match(/\d+/) || (isError && error.status === 404))
        return <NotFound/>
    if (isLoading)
        return <Center><Loader size='lg' /></Center>
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
                fullScreen: isPhone,
                innerProps: {
                    currency: data?.currency,
                    account: data
                }
            }).then(() => setLoading(false))
        }}/>
        <AccountChanges id={data?.id as number} n={10} />
    </>;
}