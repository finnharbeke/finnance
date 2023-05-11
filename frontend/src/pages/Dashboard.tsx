import { Button, Center, Divider, Paper, Skeleton, Stack, Text } from "@mantine/core";
import { spotlight } from "@mantine/spotlight";
import { DateTime } from "luxon";
import { useState } from "react";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { TbArrowsLeftRight } from 'react-icons/tb';
import { useNavigate } from "react-router-dom";
import { addTransferAction } from "../actions/actions";
import FinnanceLogo from "../components/FinnanceLogo";
import LinkButton from "../components/LinkButton";
import AccountPills from "../components/account/AccountPills";
import useIsPhone from "../hooks/useIsPhone";
import FinnanceSunburst from "../nivo/Sunburst";
import { usePrefetch } from "../query";
import { useCurrencies } from "../types/Currency";

export default function DashboardPage() {
    const isPhone = useIsPhone();
    const [loading, setLoading] = useState(false);
    const query = useCurrencies();
    const navigate = useNavigate();
    usePrefetch();

    return <>
        <AccountPills />
        {
            isPhone &&
            <Button color='grape' mb='md' fullWidth loading={loading} leftIcon={
                <TbArrowsLeftRight size={32} />
            } onClick={() => {
                setLoading(true);
                addTransferAction({}).then(() => setLoading(false))
            }} />
        }
        <Stack>
            <Button color='indigo' fullWidth
                onClick={() => spotlight.open()}
                leftIcon={<AiOutlineThunderbolt size={24}/>}
            >
                quick access
            </Button>
        </Stack>
        <Divider my='sm' />
        {
            query.isSuccess && query.data.length > 0 &&
            <Paper p='sm' withBorder onClick={() => navigate('/analysis')}>

            <FinnanceSunburst size={200} currency_id={query.data[0].id.toString()}
                min_date={DateTime.now().startOf('month')}
                max_date={DateTime.now().endOf('month')}
                interactive={false}
                />
            </Paper>
        }
        {
            query.isSuccess && query.data.length === 0 &&
            <Text align='center'>no expenses this month</Text>
        }
        {
            !query.isSuccess &&
            <Skeleton height={200} />
        }
        <Divider my='sm' />
        <Stack>
            <LinkButton to='/analysis' label='analysis' />
            <LinkButton to='/remotes' label='remote transactions' />
            <LinkButton to='/transactions' label='all transactions' />
        </Stack>
        <Center mt={25}>
            <FinnanceLogo opacity={0.1} size={200} />
        </Center>
    </>;
}