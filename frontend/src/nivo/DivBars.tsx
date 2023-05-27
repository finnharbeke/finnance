import { Box, Skeleton, Stack, useMantineTheme } from "@mantine/core";
import { ResponsiveBar } from "@nivo/bar";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Placeholder from "../components/Placeholder";
import { getAxiosData, searchParams } from "../query";
import { NivoComponentProps, NivoRequest, NivoSkeletonProps, NivoTooltip, useNivoTheme } from "./Nivo";
import { useState, useEffect } from "react";
import { useElementSize } from "@mantine/hooks";

interface Datum {
    category: string
    total: number
    [key: string]: string | number
}

interface DivBarsData {
    data: Datum[]
    keys: string[]
    total: number
}

const useDivBarsData = (props: NivoRequest) =>
    useQuery<DivBarsData, AxiosError>({
        queryKey: ["categories", "changes", "divbars", props],
        queryFn: () => getAxiosData(`/api/nivo/divbars?${searchParams(props)}`)
    });

const BAR_HEIGHT = 55;

export const DivBars = ({ request, size }: NivoComponentProps) => {
    const theme = useMantineTheme();
    const nivo = useNivoTheme();
    const query = useDivBarsData(request);

    const [data, setData] = useState<DivBarsData>()
    useEffect(() => query.data && setData(query.data), [query.data, setData])

    if (query.isError)
        return <Placeholder queries={[query]} height={3 * BAR_HEIGHT} />
    else if (data === undefined)
        return <DivBarsSkeleton {...size} />

    const { data: divBars, keys, total } = data;
    // with horizontal layout it goes bottom - up, so i reverse them
    return <Box style={{ height: divBars.length * (BAR_HEIGHT + 5) }}>

        <ResponsiveBar
            theme={nivo}
            data={divBars} keys={keys}
            indexBy='month'
            layout='horizontal'
            colors={({ id, data }) => theme.fn.lighten(data[`${id}_color`].toString(), 0.15)}
            reverse
            axisBottom={null}
            axisLeft={null}
            // borderColor={({ data: { id, data } }) => theme.fn.lighten(data['color'].toString(), 0.15)}
            borderColor={theme.colorScheme === 'light' ? theme.white : theme.colors.dark[7]}
            borderWidth={2}
            borderRadius={4}
            label={'id'}
            labelSkipWidth={64}
            labelTextColor={theme.colorScheme === 'light' ?
                theme.black : theme.white
            }
            enableGridY={false}
            tooltip={({ id, value, indexValue }) =>
                <NivoTooltip label={(indexValue !== id.toString() ? indexValue + ' - ' : '') + id.toString()} value={value} currency_id={request.currency_id} perc={value / total * 100} />}
        />
    </Box>
}

export const DivBarsSkeleton = (props: NivoSkeletonProps) => {
    const { ref, width } = useElementSize();
    return <Stack spacing='xs'>
        {
            Array(11).map((_, i) => (
                <Skeleton height={BAR_HEIGHT} width={Math.random() * width} key={i} />
            ))
        }
        <Skeleton height={BAR_HEIGHT} ref={ref} />
    </Stack>
}
