import { Box, useMantineTheme } from '@mantine/core';
import { ResponsiveSunburst, SunburstCustomLayerProps } from '@nivo/sunburst';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { DateTime } from 'luxon';
import Placeholder from '../components/Placeholder';
import useAmount from '../hooks/useAmount';
import { getAxiosData, searchParams } from '../query';
import { useCurrency } from '../types/Currency';
import { NivoProps, NivoTooltip, useNivoTheme } from './Nivo';

interface SunburstData {
    id: string
    name?: string
    color: string
    children?: SunburstData[]
    value?: number
}

const useSunburstData = (props: NivoProps) =>
    useQuery<SunburstData, AxiosError>({
        queryKey: ["categories", "changes", "sunburst", props],
        queryFn: () => getAxiosData(`/api/nivo/sunburst?${searchParams(props)}`)
    });

interface FinnanceSunburstProps {
    size: number,
    is_expense: boolean,
    min_date?: DateTime,
    max_date?: DateTime,
    currency_id: string
}

export default function FinnanceSunburst(props: FinnanceSunburstProps) {
    const {
        size,
        is_expense,
        currency_id,
        min_date,
        max_date
    } = props;
    const theme = useMantineTheme();
    const nivo = useNivoTheme();
    const query = useSunburstData({
        is_expense, currency_id,
        min_date: min_date?.toISO({ includeOffset: false }),
        max_date: max_date?.toISO({ includeOffset: false })
    });

    if (!query.isSuccess)
        return <Placeholder queries={[query]} height={size} />

    return <Box style={{ height: size }}><ResponsiveSunburst
        theme={nivo}
        data={query.data}
        cornerRadius={size / 10}
        borderColor={theme.colorScheme === 'light' ? theme.white : theme.colors.dark[7]}
        borderWidth={size / 150}
        colors={child => child.data.color}
        childColor={(_, child) => theme.fn.lighten(child.data.color, child.depth * 0.13)}

        // tooltip={node => <MyTooltip node={node} currency_id={currency_id} />}
        tooltip={node => 
            <NivoTooltip label={node.data.name || ''}
            value={node.value} perc={node.percentage}
            currency_id={currency_id} />}

        layers={[
            'arcs', 'arcLabels',
            (props) => <MiddleNumber props={props} currency_id={currency_id} size={size}/>
        ]}

        // animate={false}
        transitionMode='middleAngle'
    /></Box>
}

const MiddleNumber = ({ props: { nodes, centerX, centerY }, currency_id, size }: 
    { props: SunburstCustomLayerProps<SunburstData>, currency_id: string, size: number}) => {
    
        const total = nodes.reduce((total, datum) => total + (
        datum.path.length === 2 ? datum.value : 0), 0); // only outer
    const query = useCurrency(currency_id);
    const amount = useAmount(total, query.data);
    const theme = useMantineTheme();
    return <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
            fontSize: 18,
            fontWeight: 600,
            fill: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black
        }}
    >
        {amount}
    </text>
}
