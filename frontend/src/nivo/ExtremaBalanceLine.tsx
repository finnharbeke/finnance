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

interface ExtremaBalanceData {
    min: number
    max: number
    month?: string
    year?: string
}

interface ExtremaBalanceLineProps extends NivoComponentProps {
    timescale: 'month' | 'year'
    endpoint: string
    label: string
    dateFormat: string
}

const useExtremaBalanceData = (endpoint: string, props: NivoRequest) =>
    useQuery<ExtremaBalanceData[], AxiosError>({
        queryKey: ["nivo", endpoint, props],
        queryFn: () => getAxiosData(`/api/nivo/${endpoint}?${searchParams(props)}`)
    });

export const ExtremaBalanceLine = ({ request, size, timescale, endpoint, label, dateFormat }: ExtremaBalanceLineProps) => {
    const nivo = useNivoTheme();
    const theme = useMantineTheme();
    const query = useExtremaBalanceData(endpoint, request);

    const currency = useCurrency(request.currency_id);

    const [data, setData] = useState<ExtremaBalanceData[]>()
    useEffect(() => query.data && setData(query.data), [query.data, setData])

    useEffect(() => {
        console.log(data);
    }, [data]);

    if (query.isError || currency.isError)
        return <Placeholder queries={[query]} height={size.height} />
    if (data === undefined || currency.isLoading)
        return <LineSkeleton {...size} />
    if (data.length === 0)
        return <Text align='center' mt='md'>no data found</Text>

    // Calculate min and max with 10% padding
    const mins = data.map(d => d.min);
    const maxs = data.map(d => d.max);
    const minBalance = Math.min(...mins);
    const maxBalance = Math.max(...maxs);
    const range = maxBalance - minBalance;
    const padding = range * 0.3;
    const yMin = 0;
    const yMax = maxBalance + padding;

    const dateKey = timescale === 'month' ? 'month' : 'year';
    
    const lines = [
        {
            id: label + ' minimum',
            color: `var(--mantine-color-${theme.primaryColor}-3)`,
            data: data.map((point: ExtremaBalanceData) => ({
                y: point.min,
                x: DateTime.fromISO(point[dateKey as keyof ExtremaBalanceData] as string).toFormat(dateFormat)
            }))
        },
        {
            id: label + ' maximum',
            color: `var(--mantine-color-${theme.primaryColor}-5)`,
            data: data.map((point: ExtremaBalanceData) => ({
                y: point.max,
                x: DateTime.fromISO(point[dateKey as keyof ExtremaBalanceData] as string).toFormat(dateFormat)
            }))
        },
    ];

    const pointSize = 9;
    const pointBorderWidth = 3;
    const lineWidth = 3;
    const bottomMargin = timescale === 'month' ? 30 : 80;
    const rightMargin = timescale === 'month' ? 200 : 150;
    const legendItemHeight = timescale === 'month' ? 40 : 22;

    const plotHeight = (size.height ?? 400) - 100;

    return <Stack gap='md' style={{ height: '100%' }}>
        <Blockquote color="violet" icon={<TbInfoCircle />} style={{ fontSize: '0.9rem' }}>
            <strong>Warning:</strong> the starting saldos might be wrong in this plot. Do not gamble your life savings based on this plot, it needs to be fixed.
        </Blockquote>
        <div style={{ flex: 1, height: plotHeight }}>
            <ResponsiveLine
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
                    data: [
                        {
                            id: label + ' maximum',
                            label: 'Maximum',
                            color: `var(--mantine-color-${theme.primaryColor}-5)`
                        },
                        {
                            id: label + ' minimum',
                            label: 'Minimum',
                            color: `var(--mantine-color-${theme.primaryColor}-3)`
                        }
                    ]
                }
            ]}
        />
        </div>
    </Stack>
}
