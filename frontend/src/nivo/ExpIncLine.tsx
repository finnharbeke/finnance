import { Skeleton, Stack, Text, useMantineTheme } from "@mantine/core";
import { ResponsiveLine } from "@nivo/line";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import Placeholder from "../components/Placeholder";
import { getAxiosData, searchParams } from "../query";
import { NivoComponentProps, NivoRequest, NivoSkeletonProps, NivoTooltip, useNivoTheme } from "./Nivo";
import { useCurrency } from "../types/Currency";

interface LineData {
    expenses: number
    income: number
    month: string
}

const useExpIncLineData = (props: NivoRequest) =>
    useQuery<LineData[], AxiosError>({
        queryKey: ["categories", "changes", "line", props],
        queryFn: () => getAxiosData(`/api/nivo/line?${searchParams(props)}`)
    });

export const ExpIncLine = ({ request, size }: NivoComponentProps) => {
    const nivo = useNivoTheme();
    const theme = useMantineTheme();
    const query = useExpIncLineData(request);

    const currency = useCurrency(request.currency_id);

    const [data, setData] = useState<LineData[]>()
    useEffect(() => query.data && setData(query.data), [query.data, setData])

    if (query.isError || currency.isError)
        return <Placeholder queries={[query]} height={size.height} />
    if (data === undefined || currency.isLoading)
        return <LineSkeleton {...size} />
    if (data.length === 0)
        return <Text ta='center' mt='md'>no data found</Text>

    const lines = [
        {
            id: 'expenses',
            color: `var(--mantine-color-${theme.other.colors.expense}-5)`,
            data: data.map(month => ({
                y: month.expenses,
                x: DateTime.fromISO(month.month).toFormat('MMM yy')
            }))
        },
        {
            id: 'income',
            color: `var(--mantine-color-${theme.other.colors.income}-5)`,
            data: data.map(month => ({
                y: month.income,
                x: DateTime.fromISO(month.month).toFormat('MMM yy')
            }))
        },
    ];

    return <ResponsiveLine
            theme={nivo}
            data={lines}
            
            enableGridX={false}
            enableGridY={false}

            curve='catmullRom'

            pointColor={{ theme: 'background' }}
            pointBorderWidth={3}
            pointBorderColor={{ from: 'serieColor' }}
            pointSize={9}
            lineWidth={3}

            // colors={props => theme.fn.lighten(data[`${id}_color`].toString(), 0.15)}
            colors={{ datum: 'color' }}

            axisLeft={{
                format: (value: number) => (value / Math.pow(10, currency.data.decimals))
            }}

            margin={{
                bottom: 30,
                left: 60,
                right: 140,
                top: 20
            }}

            // axisLeft
            
            useMesh
            enableCrosshair={false}
            tooltip={({ point }) => <NivoTooltip
                label={`${point.serieId} ${point.data.x.toString()}`}
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
                    symbolShape: 'circle'
                }
            ]}
        />
}

export const LineSkeleton = ({ width, height }: NivoSkeletonProps) =>
    <Stack gap='xs' w={width} h={height}>
        <Skeleton height={5} />
        <Skeleton height={5} />
        <Skeleton height={5} />
    </Stack>
