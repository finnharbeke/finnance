import { Button, Grid, Text, Title } from "@mantine/core";
import { DateTime } from "luxon";
import { useState } from "react";
import { TbCirclePlus } from "react-icons/tb";
import { useParams } from "react-router";
import Placeholder from "../components/Placeholder";
import { AccountChanges } from "../components/account/AccountChanges";
import { openTransactionModal } from "../components/modals/TransactionModal";
import { integerToFixed } from "../helpers/convert";
import { useAccount } from "../hooks/api/useQuery";
import useIsPhone from "../hooks/useIsPhone";
import NotFound from "./404";

export default function AccountPage() {
    const params = useParams();
    const query = useAccount(parseInt(params.id as string));
    const [loading, setLoading] = useState(false);
    const isPhone = useIsPhone();

    if (!params.id?.match(/\d+/) || (query.isError && query.error.response?.status === 404))
        return <NotFound />
    if (!query.isSuccess)
        return <Placeholder queries={[query]} />

    const { data: account } = query;

    const date_created = DateTime.fromISO(account.date_created as string);

    return <>
        <Grid justify="space-between">
            <Grid.Col span="content">
                <Title order={1}>{account.desc}</Title>
                <Text fz="md">Tracking since {date_created.toRelative()}</Text>
            </Grid.Col>

            <Grid.Col span="content">
                <Title order={1}>{integerToFixed(account.saldo, account.currency)} {account.currency.code}</Title>
            </Grid.Col>
        </Grid>
        <Button size="lg" my="md" fullWidth loading={loading} leftIcon={
            <TbCirclePlus size={40} />
        } onClick={() => {
            setLoading(true);
            openTransactionModal({
                title: `new transaction - ${account.desc}`,
                fullScreen: isPhone,
                innerProps: {
                    account: account
                }
            }).then(() => setLoading(false))
        }} />
        <AccountChanges id={account.id} n={10} />
    </>;
}