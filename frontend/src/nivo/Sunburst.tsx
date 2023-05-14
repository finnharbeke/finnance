import { Box, BoxProps, ColorSwatch, Group, Paper, Text, useMantineTheme } from '@mantine/core';
import { ComputedDatum, ResponsiveSunburst, SunburstCustomLayerProps } from '@nivo/sunburst';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState } from 'react';
import Placeholder from '../components/Placeholder';
import useAmount from '../hooks/useAmount';
import { getAxiosData, searchParams, searchParamsProps } from '../query';
import { CategoryHierarchyQueryResult, useCategoryHierarchy } from '../types/Category';
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

export const DummySunburst = ({ size, is_expense }: { size: number, is_expense: boolean }) => {
    const query = useCategoryHierarchy(is_expense);
    const dummy = useCallback(
        ({ category, children }: CategoryHierarchyQueryResult): SunburstData => {
            return {
                id: category.desc, color: category.color,
                value: category.usable ? Math.random() : 0,
                children: children.map(dummy)
            }
        }, []);
    const generate = useCallback((children: CategoryHierarchyQueryResult[] | undefined) => ({
        id: 'sunburst',
        color: '#00000',
        children: children?.sort(
            (a, b) => a.category.order - b.category.order
        ).map(dummy)
        // don't ask why i need to sort, should be sorted but
        // otherwise weird stuff happens
    }), [dummy]);

    const [data, setData] = useState<SunburstData>();
    useEffect(() => setData(generate(query.data)),
        [setData, generate, query.data]);

    if (!query.isSuccess || !data)
        return <Placeholder queries={[query]} height={size} />

    return <CustomSunburst onClick={() => setData(generate(query.data))} data={data} size={size} interactive={false} />
}

interface CustomSunburstProps extends BoxProps {
    onClick?: React.MouseEventHandler<HTMLDivElement>
    data: SunburstData
    size?: number
    interactive?: boolean
    currency_id?: string
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

        tooltip={node => tooltip(node, currency_id)}

        layers={[
            'arcs', 'arcLabels',
            (props) => centeredMetric(props, currency_id, size)
        ]}

        // animate={false}
        transitionMode='middleAngle'
    /></Box>
}

const tooltip = (node: ComputedDatum<SunburstData>, currency_id: string | undefined) =>
    currency_id === undefined ?
        <TooltipNoCurrency node={node} />
        :
        <TooltipCurrency node={node} currency_id={currency_id} />

const TooltipCurrency = ({ node, currency_id }: { node: ComputedDatum<SunburstData>, currency_id: string }) => {
    const query = useCurrency(currency_id);
    const amount = useAmount(node.value, query.data);
    return <TooltipBase node={node} amount={amount} />
}

const TooltipNoCurrency = ({ node }: { node: ComputedDatum<SunburstData> }) =>
    <TooltipBase node={node} amount={node.value.toString()} />

const TooltipBase = ({ node, amount }: { node: ComputedDatum<SunburstData>, amount: string }) =>
    <Paper>
        <Group noWrap spacing='xs'>
            <ColorSwatch color={node.data.color} size={16} />
            <Text fz={14} fw={900} style={{ whiteSpace: 'nowrap' }}>{node.data.name}: {node.percentage.toFixed(0)}%,</Text>
            <Text fz={14} style={{ whiteSpace: 'nowrap' }}>{amount}</Text>
        </Group>
    </Paper>

const centeredMetric = (props: SunburstCustomLayerProps<SunburstData>, currency_id: string | undefined, size: number) =>
    currency_id === undefined ?
        <CenteredMetricNoCurrency props={props} size={size}/>
        :
        <CenteredMetricCurrency props={props} currency_id={currency_id} size={size}/>

const CenteredMetricCurrency = ({ props, currency_id, size }: { props: SunburstCustomLayerProps<SunburstData>, currency_id: string, size: number }) => {
    const total = props.nodes.reduce((total, datum) => total + (
        datum.path.length === 2 ? datum.value : 0), 0); // only outer
    const query = useCurrency(currency_id);
    const amount = useAmount(total, query.data);
    return total === 0 ? <></> : <CenteredMetricBase {...props} middle={amount} size={size} />
}

const CenteredMetricNoCurrency = ({ props, size }: { props: SunburstCustomLayerProps<SunburstData>, size: number }) => {
    const total = props.nodes.reduce((total, datum) => total + (
        datum.path.length === 2 ? datum.value : 0), 0); // only outer
    return total === 0 ? <></> : <CenteredMetricBase {...props} middle={total.toString()} size={size} />
}

interface CenteredMetricBaseProps extends SunburstCustomLayerProps<SunburstData> {
    middle: string
    size: number
}

const CenteredMetricBase = ({ centerX, centerY, middle, size }: CenteredMetricBaseProps) => {
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
        {middle}
    </text>
}
