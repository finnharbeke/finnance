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

const useLineData = (props: NivoRequest) =>
    useQuery<LineData[], AxiosError>({
        queryKey: ["categories", "changes", "line", props],
        queryFn: () => getAxiosData(`/api/nivo/line?${searchParams(props)}`)
    });

export const Line = ({ request, size }: NivoComponentProps) => {
    const theme = useMantineTheme();
    const nivo = useNivoTheme();
    const query = useLineData(request);

    const currency = useCurrency(request.currency_id);

    const [data, setData] = useState<LineData[]>()
    useEffect(() => query.data && setData(query.data), [query.data, setData])

    if (query.isError || currency.isError)
        return <Placeholder queries={[query]} height={size.height} />
    if (data === undefined || currency.isLoading)
        return <LineSkeleton {...size} />
    if (data.length === 0)
        return <Text align='center' mt='md'>no data found</Text>

    const lines = [
        {
            id: 'expenses',
            color: theme.colors.red[theme.fn.primaryShade()],
            data: data.map(month => ({
                y: month.expenses,
                x: DateTime.fromISO(month.month).toFormat('MMM yy')
            }))
        },
        {
            id: 'income',
            color: theme.colors.blue[theme.fn.primaryShade()],
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
                right: 30,
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
        />
}

export const LineSkeleton = ({ width, height }: NivoSkeletonProps) =>
    <Stack spacing='xs' w={width} h={height}>
        <Skeleton height={5} />
        <Skeleton height={5} />
        <Skeleton height={5} />
    </Stack>
