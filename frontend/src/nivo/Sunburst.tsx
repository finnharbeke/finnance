import { ResponsiveSunburst } from '@nivo/sunburst'
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Placeholder from '../components/Placeholder';
import { getAxiosData } from '../hooks/api/useQuery';
import { Box, useMantineTheme } from '@mantine/core';

interface SunburstData {
    name: string,
    color: string
    children?: SunburstData[]
    loc?: number
}

const useSunburstData = () =>
    useQuery<SunburstData, AxiosError>({
        queryKey: ["categories", "changes", "sunburst"],
        queryFn: () => getAxiosData('/api/nivo/sunburst')
    });

export default function ExpensesSunburst({ size, interactive }: { size: number, interactive?: boolean }) {
    const query = useSunburstData();
    const theme = useMantineTheme();

    if (!query.isSuccess)
        return <Placeholder queries={[query]} height={size} />

    return <Box style={{ height: size }}><ResponsiveSunburst
        data={query.data}

        cornerRadius={size / 10}
        borderColor={theme.colorScheme === 'light' ? theme.white : theme.colors.dark[7]}
        borderWidth={size / 150}
        isInteractive={interactive ?? true}

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

        transitionMode='middleAngle'
    /></Box>
}