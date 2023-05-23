import { Button, Center, Paper, Skeleton, Text, useMantineTheme } from "@mantine/core";
import { spotlight } from "@mantine/spotlight";
import { DateTime } from "luxon";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import FinnanceLogo from "../components/FinnanceLogo";
import AccountPills from "../components/account/AccountPills";
import FinnanceSunburst from "../nivo/Sunburst";
import { usePrefetch } from "../query";
import { useCurrencies } from "../types/Currency";
import { useSmallerThan } from "../hooks/useSmallerthan";

export default function DashboardPage() {
    const theme = useMantineTheme();
    const query = useCurrencies();
    const navigate = useNavigate();

    const isSm = useSmallerThan('sm');

    usePrefetch();

    return <>
        <AccountPills />
        <Button color={theme.other.colors.quick} fullWidth
            onClick={() => spotlight.open()}
            leftIcon={<AiOutlineThunderbolt size={24} />}
        >
            quick access
        </Button>
        {
            query.isSuccess ?
                <Paper p='sm' onClick={() => navigate('/analytics')} my='sm'>
                    {
                        query.data.length > 0 &&
                        <FinnanceSunburst size={isSm ? 200 : 300} currency_id={query.data[0].id.toString()}
                            min_date={DateTime.now().startOf('month')}
                            max_date={DateTime.now().endOf('month')}
                            interactive={true}
                        />
                    }
                    {
                        query.data.length === 0 &&
                        <Text align='center'>no expenses this month</Text>
                    }
                </Paper>
                :
                <Skeleton height={200} my='sm' />
        }
        <Center mt={75}>
            <FinnanceLogo opacity={0.1} size={200} />
        </Center>
    </>;
}