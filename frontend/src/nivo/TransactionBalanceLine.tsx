import { Text, useMantineTheme, Blockquote, Stack } from "@mantine/core";
import { TbInfoCircle } from 'react-icons/tb';
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
    const yMin = 0;
    const yMax = maxBalance + padding;

    const lines = [
        {
            id: 'Balance',
            color: `var(--mantine-color-${theme.primaryColor}-5)`,
            data: data.map(point => ({
                y: point.balance,
                x: DateTime.fromISO(point.date).toJSDate()
            }))
        },
    ];

    // Generate tick values for the closest date to the 15th of every month across all years in the data
    const tickValues = (() => {
        const ticks: string[] = [];
        const dates = data.map(d => DateTime.fromISO(d.date));
        
        if (dates.length === 0) return ticks;
        
        const minDate = DateTime.min(...dates);
        const maxDate = DateTime.max(...dates);
        
        // Iterate through each month from min to max date
        let current = minDate.startOf('month').set({ day: 15 });
        while (current <= maxDate) {
            // Find the closest date to the 15th of current month/year in the actual data
            const closestDate = dates.reduce((closest, candidate) => {
                const currentDiff = Math.abs(candidate.diff(current).as('days'));
                const closestDiff = Math.abs(closest.diff(current).as('days'));
                return currentDiff < closestDiff ? candidate : closest;
            });
            
            ticks.push(closestDate.toFormat('MMM dd'));
            current = current.plus({ months: 1 });
        }
        return ticks;
    })();

    const plotHeight = (size.height ?? 400) - 100;

    return <ResponsiveLine
            theme={nivo}
            data={lines}
            
            enableGridX={false}
            enableGridY={false}

            curve='step'
            
            yScale={{
                type: 'linear',
                min: yMin,
                max: yMax
            }}

            xScale={{ format: "time:%Y-%m-%dT%H:%M:%S.%f", type: "time" }}
            xFormat="time:%Y-%m-%dT%H:%M:%S.%f"

            axisBottom={{
                tickRotation: -45,
                tickValues: "every 30 days",
                tickSize: 5,
                tickPadding: 5,
                format: "%b",
                legendOffset: 36,
                legendPosition: "middle"
            }}

            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointSize={0}
            lineWidth={2}

            colors={{ datum: 'color' }}

            axisLeft={{
                format: (value: number) => (value / Math.pow(10, currency.data.decimals))
            }}

            margin={{
                bottom: 80,
                left: 60,
                right: 140,
                top: 20
            }}

            useMesh
            enableCrosshair={false}
            tooltip={({ point }) => <NivoTooltip
                label={ DateTime.fromJSDate(point.data.x as Date).toFormat("LLL dd, HH:mm") }
                value={point.data.y as number}
                currency_id={request.currency_id}
            />}

            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    translateX: 120,
                    itemWidth: 80,
                    itemHeight: 22,
                    itemDirection: 'right-to-left',
                    symbolShape: 'circle',
                    data: [
                        {
                            id: 'balance',
                            label: 'Balance',
                            color: `var(--mantine-color-${theme.primaryColor}-5)`
                        }
                    ]
                }
            ]}
        />
}
