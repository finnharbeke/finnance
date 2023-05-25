import { Paper, Stack, Text, useMantineTheme } from "@mantine/core";
import { Theme } from "@nivo/core";
import useAmount from "../hooks/useAmount";
import { searchParamsProps } from "../query";
import { useCurrency } from "../types/Currency";

export const useNivoTheme = (): Theme => {
    const theme = useMantineTheme();

    return {
        textColor: theme.colorScheme === 'light' ?
            theme.black : theme.colors.dark[0],
        fontSize: 14,
    }
}

export interface NivoProps extends searchParamsProps {
    is_expense: boolean
    currency_id: string
    min_date?: string
    max_date?: string
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
        <Stack spacing={0}>
            <Text fz={14} fw={900} lineClamp={1}>{label}{perc ? `: ${perc.toFixed(0)}%` : ''}</Text>
            <Text fz={14} lineClamp={1}>{amount}</Text>
        </Stack>
    </Paper>
}