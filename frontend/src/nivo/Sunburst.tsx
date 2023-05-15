import { Box, BoxProps, ColorSwatch, Group, Paper, Text, useMantineTheme } from '@mantine/core';
import { ComputedDatum, ResponsiveSunburst, SunburstCustomLayerProps } from '@nivo/sunburst';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { DateTime } from 'luxon';
import Placeholder from '../components/Placeholder';
import useAmount from '../hooks/useAmount';
import { getAxiosData, searchParams, searchParamsProps } from '../query';
import { useCurrency } from '../types/Currency';

interface SunburstData {
    id: string
    name?: string
    color: string
    children?: SunburstData[]
    value?: number
}

interface useSunburstDataProps extends searchParamsProps {
    is_expense: boolean
    currency_id: string
    min_date?: string
    max_date?: string
}

const useSunburstData = (props: useSunburstDataProps) =>
    useQuery<SunburstData, AxiosError>({
        queryKey: ["categories", "changes", "sunburst", props],
        queryFn: () => getAxiosData(`/api/nivo/sunburst?${searchParams(props)}`)
    });

interface FinnanceSunburstProps {
    size: number,
    is_expense?: boolean,
    min_date?: DateTime,
    max_date?: DateTime,
    currency_id: string
    interactive?: boolean 
}

export default function FinnanceSunburst(props: FinnanceSunburstProps) {

    const {
        size,
        is_expense = true,
        interactive = true,
        currency_id,
        min_date = DateTime.now().startOf('month'),
        max_date
    } = props;

    const query = useSunburstData({
        is_expense, currency_id,
        min_date: min_date.toISO({ includeOffset: false }),
        max_date: max_date?.toISO({ includeOffset: false })
    });

    if (!query.isSuccess)
        return <Placeholder queries={[query]} height={size} />

    return <CustomSunburst data={query.data} size={size} currency_id={currency_id} interactive={interactive} />
}

interface CustomSunburstProps extends BoxProps {
    onClick?: React.MouseEventHandler<HTMLDivElement>
    data: SunburstData
    size?: number
    interactive?: boolean
    currency_id: string
}

const CustomSunburst = ({ data, size = 200, interactive = true, onClick, currency_id }: CustomSunburstProps) => {
    const theme = useMantineTheme();
    return <Box style={{ height: size }} onClick={onClick}><ResponsiveSunburst
        data={data}

        cornerRadius={size / 10}
        borderColor={theme.colorScheme === 'light' ? theme.white : theme.colors.dark[7]}
        borderWidth={size / 150}
        isInteractive={interactive}

        theme={{
            fontSize: 16,
            tooltip: {
                container: {
                    background: theme.colorScheme === 'light' ? theme.colors.gray[2] : theme.colors.dark[6],
                    color: theme.colorScheme === 'dark' ? theme.colors.gray[3] : theme.colors.gray[7],
                }
            }
        }}
        colors={child => child.data.color}
        childColor={(_, child) => theme.fn.lighten(child.data.color, child.depth * 0.13)}

        tooltip={node => <MyTooltip node={node} currency_id={currency_id} />}

        layers={[
            'arcs', 'arcLabels',
            (props) => <MiddleNumber props={props} currency_id={currency_id} size={size}/>
        ]}

        // animate={false}
        transitionMode='middleAngle'
    /></Box>
}

const MyTooltip = ({ node, currency_id }: { node: ComputedDatum<SunburstData>, currency_id: string }) => {
    const query = useCurrency(currency_id);
    const amount = useAmount(node.value, query.data);
    return <Paper p='xs'>
        <Group noWrap spacing='xs'>
            <ColorSwatch color={node.data.color} size={16} />
            <Text fz={14} fw={900} style={{ whiteSpace: 'nowrap' }}>{node.data.name}: {node.percentage.toFixed(0)}%,</Text>
            <Text fz={14} style={{ whiteSpace: 'nowrap' }}>{amount}</Text>
        </Group>
    </Paper>
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
            fontSize: size / 15,
            fontWeight: 600,
            fill: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.dark[8]
        }}
    >
        {amount}
    </text>
}
