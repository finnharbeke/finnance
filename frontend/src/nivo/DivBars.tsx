import { Box, lighten, Skeleton, Stack, Text, useComputedColorScheme, useMantineTheme } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { ResponsiveBar } from "@nivo/bar";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import Placeholder from "../components/Placeholder";
import { getAxiosData, searchParams } from "../query";
import { NivoComponentProps, NivoRequest, NivoSkeletonProps, NivoTooltip, useNivoTheme } from "./Nivo";

interface Datum {
    category: string
    total_expenses: number
    total_income: number
    [key: string]: string | number
}

interface DivBarsData {
    data: Datum[]
    keys: string[]
}

const useDivBarsData = (props: NivoRequest) =>
    useQuery<DivBarsData, AxiosError>({
        queryKey: ["categories", "changes", "divbars", props],
        queryFn: () => getAxiosData(`/api/nivo/divbars?${searchParams(props)}`)
    });

const BAR_HEIGHT = 40;

export const DivBars = ({ request, size }: NivoComponentProps) => {
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();
    const nivo = useNivoTheme();
    const query = useDivBarsData(request);

    const [data, setData] = useState<DivBarsData>()
    useEffect(() => query.data && setData(query.data), [query.data, setData])

    if (query.isError)
        return <Placeholder queries={[query]} height={3 * BAR_HEIGHT} />
    else if (data === undefined)
        return <DivBarsSkeleton {...size} />

    const { data: divBars, keys } = data;
    // with horizontal layout it goes bottom - up, so i reverse them

    const max = Math.max(
        ...divBars.map(v => v.total_expenses),
        ...divBars.map(v => v.total_income)
    )

    if (divBars.length === 0 || max === 0)
        return <Text align='center'>no data found</Text>
        

    return <Box style={{ height: divBars.length * (BAR_HEIGHT + 2) }}>

        <ResponsiveBar
            theme={nivo}
            data={divBars} keys={keys}
            minValue={-max}
            maxValue={max}
            indexBy='month'
            layout='horizontal'
            colors={({ id, data }) => lighten(data[`${id}_color`].toString(), 0.15)}
            reverse
            axisBottom={null}
            axisLeft={null}
            // borderColor={({ data: { id, data } }) => theme.fn.lighten(data['color'].toString(), 0.15)}
            borderColor={colorScheme === 'light' ? theme.white : theme.colors.dark[7]}
            borderWidth={2}
            borderRadius={4}
            padding={0}
            label={'id'}
            labelSkipWidth={64}
            labelTextColor={colorScheme === 'light' ?
                theme.black : theme.white
            }
            enableGridY={false}
            tooltip={({ id, value, indexValue }) =>
                <NivoTooltip
                    label={DateTime.fromISO(indexValue.toString()).toFormat('MMM yy').toLowerCase() + ' - ' + id.toString()}
                    value={value > 0 ? value : -value} currency_id={request.currency_id} />}
            markers={[{
                    axis: 'x',
                    value: 0,
                    lineStyle: { stroke: 'var(--mantine-primary-color-filled)', strokeWidth: 1 },
                }]}
        />
    </Box>
}

export const DivBarsSkeleton = (props: NivoSkeletonProps) => {
    const { ref, width } = useElementSize();
    return <Stack gap='xs'>
        {
            Array(11).map((_, i) => (
                <Skeleton height={BAR_HEIGHT} width={Math.random() * width} key={i} />
            ))
        }
        <Skeleton height={BAR_HEIGHT} ref={ref} />
    </Stack>
}
