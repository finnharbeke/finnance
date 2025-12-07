import { Text, useMantineTheme } from "@mantine/core";
import { ResponsiveLine } from "@nivo/line";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import Placeholder from "../components/Placeholder";
import { getAxiosData, searchParams } from "../query";
import { NivoComponentProps, NivoRequest, NivoTooltip, useNivoTheme } from "./Nivo";
import { useCurrency } from "../types/Currency";
import { LineSkeleton } from "./ExpIncLine";

interface TransactionData {
    balance: number
    date: string
}

const useTransactionBalanceLineData = (props: NivoRequest) =>
    useQuery<TransactionData[], AxiosError>({
        queryKey: ["nivo", "transactionbalanceline", props],
        queryFn: () => getAxiosData(`/api/nivo/transactionbalanceline?${searchParams(props)}`)
    });

export const TransactionBalanceLine = ({ request, size }: NivoComponentProps) => {
    const nivo = useNivoTheme();
    const theme = useMantineTheme();
    const query = useTransactionBalanceLineData(request);

    const currency = useCurrency(request.currency_id);

    const [data, setData] = useState<TransactionData[]>()
    useEffect(() => query.data && setData(query.data), [query.data, setData])

    if (query.isError || currency.isError)
        return <Placeholder queries={[query]} height={size.height} />
    if (data === undefined || currency.isLoading)
        return <LineSkeleton {...size} />
    if (data.length === 0)
        return <Text align='center' mt='md'>no data found</Text>

    // Calculate min and max with 10% padding
    const balances = data.map(d => d.balance);
    const minBalance = Math.min(...balances);
    const maxBalance = Math.max(...balances);
    const range = maxBalance - minBalance;
    const padding = range * 0.1;
    const yMin = minBalance - padding;
    const yMax = maxBalance + padding;

    const lines = [
        {
            id: 'Balance',
            color: `var(--mantine-color-${theme.primaryColor}-5)`,
            data: data.map(point => ({
                y: point.balance,
                x: DateTime.fromISO(point.date).toFormat('MMM dd, HH:mm')
            }))
        },
    ];

    return <ResponsiveLine
            theme={nivo}
            data={lines}
            
            enableGridX={true}
            enableGridY={true}

            curve='linear'
            
            yScale={{
                type: 'linear',
                min: yMin,
                max: yMax
            }}

            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointSize={4}
            lineWidth={2}

            colors={{ datum: 'color' }}

            axisLeft={{
                format: (value: number) => (value / Math.pow(10, currency.data.decimals))
            }}

            axisBottom={{
                tickRotation: -45,
            }}

            margin={{
                bottom: 80,
                left: 60,
                right: 20,
                top: 20
            }}

            useMesh
            enableCrosshair={false}
            tooltip={({ point }) => <NivoTooltip
                label={`${point.data.x.toString()}`}
                value={point.data.y as number}
                currency_id={request.currency_id}
            />}

            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    translateX: 0,
                    itemWidth: 80,
                    itemHeight: 22,
                    itemDirection: 'right-to-left',
                    symbolShape: 'circle'
                }
            ]}
        />
}
