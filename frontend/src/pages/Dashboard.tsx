import { Button, Center, Paper, Skeleton, Text, useMantineTheme, useMatches } from "@mantine/core";
import { spotlight } from "@mantine/spotlight";
import { DateTime } from "luxon";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import FinnanceLogo from "../components/FinnanceLogo";
import AccountPills from "../components/account/AccountPills";
import { NivoShell } from "../nivo/Nivo";
import { Sunburst, SunburstSkeleton } from "../nivo/Sunburst";
import { usePrefetch } from "../query";
import { useCurrencies } from "../types/Currency";
import { initialCurrenciesAction } from "../actions/actions";
import { useEffect } from "react";

export default function DashboardPage() {
    const theme = useMantineTheme();
    const query = useCurrencies();
    const navigate = useNavigate();

    const height = useMatches({
        base: 200,
        sm: 300,
      });

    usePrefetch();

    useEffect(() => {
        if (query.isSuccess && query.data.length === 0) {
            initialCurrenciesAction();
        }
    }, [query])

    return <>
        <AccountPills />
        <Button color={theme.other.colors.quick} fullWidth
            onClick={() => spotlight.open()}
            leftSection={<AiOutlineThunderbolt size={24} />}
        >
            quick access
        </Button>
        {
            query.isSuccess ?
                <Paper p='sm' onClick={() => navigate('/analytics')} my='sm'>
                    {
                        query.data.length > 0 &&
                        <NivoShell
                            nivo={Sunburst} skeleton={SunburstSkeleton}
                            height={height}
                            currency_id={query.data[0].id.toString()}
                            min_date={DateTime.now().startOf('month')}
                            max_date={DateTime.now().endOf('month')}
                            is_expense={true}
                        />
                    }
                    {
                        query.data.length === 0 &&
                        <Text align='center'>no expenses this month</Text>
                    }
                </Paper>
                :
                <Skeleton height={height} my='sm' />
        }
        <Center mt={75} mb='sm'>
            <FinnanceLogo opacity={0.1} size={200} />
        </Center>
    </>;
}