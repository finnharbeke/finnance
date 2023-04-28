import { Button, ColorSwatch, Flex, Group, Text, Title, useMantineTheme } from "@mantine/core";
import { DateTime } from "luxon";
import { useState } from "react";
import { TbCirclePlus } from "react-icons/tb";
import { useParams } from "react-router";
import Placeholder from "../components/Placeholder";
import { FilterableChanges } from "../components/account/ChangePills";
import { openTransactionModal } from "../components/modals/TransactionModal";
import { useAccount } from "../hooks/api/useQuery";
import useIsPhone from "../hooks/useIsPhone";
import NotFound from "./404";
import useAmount from "../hooks/useAmount";

export default function AccountPage() {
    const theme = useMantineTheme();
    const params = useParams();
    const query = useAccount(parseInt(params.id as string));
    const [loading, setLoading] = useState(false);
    const isPhone = useIsPhone();
    const saldo = useAmount(query.data?.saldo, query.data?.currency);

    if (!params.id?.match(/\d+/) || (query.isError && query.error.response?.status === 404))
        return <NotFound />
    if (!query.isSuccess)
        return <Placeholder queries={[query]} />

    const { data: account } = query;

    const date_created = DateTime.fromISO(account.date_created as string);

    return <>
        <Flex justify="space-between" wrap='wrap'>
            <Group noWrap>
            <Title order={1}>{account.desc}</Title>
            <ColorSwatch color={account.color} size={theme.headings.sizes.h1.fontSize}/>
            </Group>
            <Title order={1} lineClamp={1}>{saldo}</Title>

        </Flex>
        <Text fz="md">Tracking since {date_created.toRelative()}</Text>
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
        <FilterableChanges id={account.id} />
    </>;
}