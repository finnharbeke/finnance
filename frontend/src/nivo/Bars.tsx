import { Box, useMantineTheme } from "@mantine/core";
import { BarSvgProps, ResponsiveBar } from "@nivo/bar";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { DateTime } from "luxon";
import Placeholder from "../components/Placeholder";
import { getAxiosData, searchParams } from "../query";
import { NivoProps, NivoTooltip, useNivoTheme } from "./Nivo";

interface Datum {
    category: string
    color: string
    [key: string]: string | number
}

interface BarsData {
    data: Datum[]
    keys: string[]
    total: number
}

const useBarsData = (props: NivoProps) =>
    useQuery<BarsData, AxiosError>({
        queryKey: ["categories", "changes", "bars", props],
        queryFn: () => getAxiosData(`/api/nivo/bars?${searchParams(props)}`)
    });

interface FinnanceBarsProps extends Omit<BarSvgProps<Datum>, "height" | "width" | "data"> {
    is_expense: boolean,
    min_date?: DateTime,
    max_date?: DateTime,
    currency_id: string
}

export const FinnanceBars = (props: FinnanceBarsProps) => {
    const {
        is_expense, currency_id,
        min_date, max_date, ...others
    } = props;
    const theme = useMantineTheme();
    const nivo = useNivoTheme();
    const query = useBarsData({
        is_expense, currency_id,
        min_date: min_date?.toISO({ includeOffset: false }),
        max_date: max_date?.toISO({ includeOffset: false })
    });

    if (!query.isSuccess)
        return <Placeholder height={300} queries={[query]} />

    const { data, keys, total } = query.data;
    return <Box style={{ height: data.length * 60 }}>
        <ResponsiveBar
            theme={nivo}
            data={data} keys={keys}
            indexBy='category'
            layout='horizontal'
            colors={({ id, data }) => theme.fn.lighten(data[`${id}_color`].toString(), 0.15)}
            
            axisBottom={null}
            axisLeft={null}
            // borderColor={({ data: { id, data } }) => data['color']}
            borderColor={theme.colorScheme === 'light' ? theme.white : theme.colors.dark[7]}
            borderWidth={2}
            borderRadius={10}
            label={'id'}
            labelSkipWidth={64}
            labelTextColor={theme.colorScheme === 'light' ?
                theme.black : theme.white
            }
            enableGridY={false}
            tooltip={({ id, value }) =>
                <NivoTooltip label={id.toString()} value={value} currency_id={currency_id} perc={value / total * 100} />}
            {...others}
        />
    </Box>
}