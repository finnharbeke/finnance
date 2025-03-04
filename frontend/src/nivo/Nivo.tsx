import { Box, Paper, Stack, Text, useComputedColorScheme, useMantineTheme } from "@mantine/core";
import { Theme } from "@nivo/core";
import { DateTime } from "luxon";
import useAmount from "../hooks/useAmount";
import { searchParamsProps } from "../query";
import { useCurrency } from "../types/Currency";

export const useNivoTheme = (): Theme => {
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();
    return {
        text: {
            fill: colorScheme === 'light' ?
                theme.black : theme.colors.dark[0],
            fontSize: 14
        }
    }
}

export interface NivoRequest extends searchParamsProps {
    is_expense?: boolean
    currency_id: string
    min_date: string
    max_date: string
}

interface NivoTooltipProps {
    label: string
    value: number
    perc?: number
    currency_id: string
}

export const NivoTooltip = ({ label, value, perc, currency_id }: NivoTooltipProps) => {
    const query = useCurrency(currency_id);
    const amount = useAmount(value, query.data);
    return <Paper p='xs'>
        <Stack gap={0}>
            <Text fz={14} fw={900} lineClamp={1}>{label}{perc ? `: ${perc.toFixed(0)}%` : ''}</Text>
            <Text fz={14} lineClamp={1}>{amount}</Text>
        </Stack>
    </Paper>
}

export interface NivoSkeletonProps {
    width?: number
    height?: number
}

export interface NivoComponentProps {
    request: NivoRequest
    size: NivoSkeletonProps
}

interface NivoProps extends NivoSkeletonProps {
    nivo: (props: NivoComponentProps) => JSX.Element,
    skeleton: (props: NivoSkeletonProps) => JSX.Element,
    is_expense?: boolean
    currency_id: string | null
    min_date: DateTime
    max_date: DateTime
}

export const NivoShell = (props: NivoProps) => {
    const {
        nivo, skeleton,
        width, height,
        currency_id, is_expense,
        min_date, max_date
    } = props;

    const MyComponent = nivo;
    const MySkeleton = skeleton;
    if (!currency_id)
        return <>
        <MySkeleton {...{ width, height }} />
        {currency_id}
        </>

    const request: NivoRequest = {
        currency_id, is_expense,
        min_date: min_date?.toISO({ includeOffset: false }),
        max_date: max_date?.toISO({ includeOffset: false })
    }

    return <Box style={{ width, height }}>
        <MyComponent request={request} size={{ width, height }} />
    </Box>
}