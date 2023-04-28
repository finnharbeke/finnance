import { Box, BoxProps, ColorSwatch, Group, Paper, Text, useMantineTheme } from '@mantine/core';
import { ComputedDatum, ResponsiveSunburst } from '@nivo/sunburst';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { DateTime } from 'luxon';
import { useState } from 'react';
import Placeholder from '../components/Placeholder';
import { getAxiosData, searchParams, searchParamsProps, useCurrency } from '../hooks/api/useQuery';
import useAmount from '../hooks/useAmount';
import { CategoryQueryResult, useCategories } from '../types/Category';

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
}

export default function FinnanceSunburst(props: FinnanceSunburstProps) {

    const {
        size,
        is_expense = true,
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

    return <CustomSunburst data={query.data} size={size} currency_id={currency_id} />
}

export const DummySunburst = ({ size }: { size: number }) => {
    const query = useCategories();
    const generate = (cats: CategoryQueryResult[] | undefined) => ({
        id: 'sunburst',
        color: '#00000',
        children: !cats ? [] : cats.filter(c => c.parent === null).map(c => dummy(cats, c, false))
    })
    const dummy: (cats: CategoryQueryResult[], c: CategoryQueryResult, inside: boolean) => SunburstData = (cats, c, inside) => {
        const children = cats.filter(c2 => c2.parent_id === c.id || c2.id === c.id);
        const end = children.length === 1 || inside;
        return {
            id: c.desc, color: c.color,
            children: end ?
                [{ id: `${c.desc}.agent`, color: c.color, value: Math.random() }]
                : children.map(c2 => dummy(cats, c2, c2.id === c.id))
        }
    }

    const [data, setData] = useState<SunburstData>(generate(query.data));

    if (!query.isSuccess)
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
    <Paper p='xs' withBorder>
        <Group noWrap spacing='xs'>
            <ColorSwatch color={node.data.color} size={16}/>
            <Text fz={14} fw={900} style={{ whiteSpace: 'nowrap' }}>{node.data.name}: {node.percentage.toFixed(0)}%,</Text>
            <Text fz={14} style={{ whiteSpace: 'nowrap' }}>{amount}</Text>
        </Group>
    </Paper>