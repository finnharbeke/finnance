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

interface MinimumBalanceData {
    balance: number
    month?: string
    year?: string
}

interface MinimumBalanceLineProps extends NivoComponentProps {
    timescale: 'month' | 'year'
    endpoint: string
    label: string
    dateFormat: string
}

const useMinimumBalanceData = (endpoint: string, props: NivoRequest) =>
    useQuery<MinimumBalanceData[], AxiosError>({
        queryKey: ["nivo", endpoint, props],
        queryFn: () => getAxiosData(`/api/nivo/${endpoint}?${searchParams(props)}`)
    });

export const MinimumBalanceLine = ({ request, size, timescale, endpoint, label, dateFormat }: MinimumBalanceLineProps) => {
    const nivo = useNivoTheme();
    const theme = useMantineTheme();
    const query = useMinimumBalanceData(endpoint, request);

    const currency = useCurrency(request.currency_id);

    const [data, setData] = useState<MinimumBalanceData[]>()
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
    const padding = range * 0.3;
    const yMin = 0;
    const yMax = maxBalance + padding;

    const dateKey = timescale === 'month' ? 'month' : 'year';
    
    const lines = [
        {
            id: label,
            color: `var(--mantine-color-${theme.primaryColor}-5)`,
            data: data.map(point => ({
                y: point.balance,
                x: DateTime.fromISO(point[dateKey as keyof MinimumBalanceData] as string).toFormat(dateFormat)
            }))
        },
    ];

    const pointSize = 9;
    const pointBorderWidth = 3;
    const lineWidth = 3;
    const bottomMargin = timescale === 'month' ? 30 : 80;
    const rightMargin = timescale === 'month' ? 200 : 150;
    const legendItemHeight = timescale === 'month' ? 40 : 22;

    return <ResponsiveLine
            theme={nivo}
            data={lines}
            
            enableGridX={false}
            enableGridY={false}

            curve='linear'
            
            yScale={{
                type: 'linear',
                min: yMin,
                max: yMax
            }}

            pointColor={{ theme: 'background' }}
            pointBorderWidth={pointBorderWidth}
            pointBorderColor={{ from: 'serieColor' }}
            pointSize={pointSize}
            lineWidth={lineWidth}

            colors={{ datum: 'color' }}

            axisLeft={{
                format: (value: number) => (value / Math.pow(10, currency.data.decimals))
            }}

            axisBottom={timescale === 'year' ? {
                tickRotation: -45,
            } : undefined}

            margin={{
                bottom: bottomMargin,
                left: 60,
                right: rightMargin,
                top: 20
            }}

            useMesh
            enableCrosshair={false}
            tooltip={({ point }) => <NivoTooltip
                label={timescale === 'month' ? `${point.serieId} ${point.data.x.toString()}` : point.data.x.toString()}
                value={point.data.y as number}
                currency_id={request.currency_id}
            />}

            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    translateX: 120,
                    itemWidth: 80,
                    itemHeight: legendItemHeight,
                    itemDirection: 'right-to-left',
                    symbolShape: 'circle',
                    data: timescale === 'month' ? [
                        {
                            id: 'balance',
                            label: 'Monthly\nminimum',
                            color: `var(--mantine-color-${theme.primaryColor}-5)`
                        }
                    ] : [
                        {
                            id: 'balance',
                            label: 'Yearly\nminimum',
                            color: `var(--mantine-color-${theme.primaryColor}-5)`
                        }
                    ]
                }
            ]}
        />
}
