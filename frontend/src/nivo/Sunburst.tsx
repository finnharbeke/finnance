import { lighten, Skeleton, useComputedColorScheme, useMantineTheme } from '@mantine/core';
import { ResponsiveSunburst, SunburstCustomLayerProps } from '@nivo/sunburst';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import Placeholder from '../components/Placeholder';
import useAmount from '../hooks/useAmount';
import { getAxiosData, searchParams } from '../query';
import { useCurrency } from '../types/Currency';
import { NivoComponentProps, NivoRequest, NivoSkeletonProps, NivoTooltip, useNivoTheme } from './Nivo';

interface SunburstData {
    id: string
    name?: string
    color: string
    children?: SunburstData[]
    value?: number
}

const useSunburstData = (props: NivoRequest) =>
    useQuery<SunburstData, AxiosError>({
        queryKey: ["categories", "changes", "sunburst", props],
        queryFn: () => getAxiosData(`/api/nivo/sunburst?${searchParams(props)}`)
    });

export const Sunburst = ({ request, size }: NivoComponentProps) => {
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();
    const nivo = useNivoTheme();
    const query = useSunburstData(request);
    const height = size.height || 500;
    const [ data, setData ] = useState<SunburstData>()
    useEffect(() => query.data && setData(query.data), [query.data, setData])

    if (query.isError)
        return <Placeholder queries={[query]} height={height} />
    if (data === undefined)
        return <SunburstSkeleton {...size} />

    return <ResponsiveSunburst
        theme={nivo}
        data={data}
        cornerRadius={height / 10}
        borderColor={colorScheme === 'light' ? theme.white : theme.colors.dark[7]}
        borderWidth={height / 150}
        colors={child => child.data.color}
        childColor={(_, child) => lighten(child.data.color, child.depth * 0.13)}

        // tooltip={node => <MyTooltip node={node} currency_id={currency_id} />}
        tooltip={node => 
            <NivoTooltip label={node.data.name || ''}
            value={node.value} perc={node.percentage}
            currency_id={request.currency_id} />}

        layers={[
            'arcs', 'arcLabels',
            (props) => <MiddleNumber props={props} currency_id={request.currency_id} />
        ]}

        // animate={false}
        transitionMode='middleAngle'
    />
}

const MiddleNumber = ({ props: { nodes, centerX, centerY }, currency_id }: 
    { props: SunburstCustomLayerProps<SunburstData>, currency_id: string }) => {
    
        const total = nodes.reduce((total, datum) => total + (
        datum.path.length === 2 ? datum.value : 0), 0); // only outer
    const query = useCurrency(currency_id);
    const amount = useAmount(total, query.data);
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();
    return <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
            fontSize: 18,
            fontWeight: 600,
            fill: colorScheme === 'dark' ? theme.colors.dark[0] : theme.black
        }}
    >
        {amount}
    </text>
}

export const SunburstSkeleton = ({ height }: NivoSkeletonProps) => {
    return <Skeleton height={height} circle />
}