import { Center, Grid, NumberInput, SimpleGrid, Stack, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { DateTime, Duration } from "luxon";
import CurrencyInput from "../components/input/CurrencyInput";
import useIsPhone from "../hooks/useIsPhone";
import FinnanceSunburst from "./Sunburst";

interface FormValues {
    currency_id: string
    n_months: number
}

export default function NivoPage() {
    const form = useForm<FormValues>({
        initialValues: {
            currency_id: '',
            n_months: 6
        }
    })

    const { width } = useViewportSize();
    const isPhone = useIsPhone();

    return <>
        <Grid mb='md'>
            <Grid.Col span={12} md={6}>
                <CurrencyInput hasDefault label='currency' {...form.getInputProps('currency_id')} />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
                <NumberInput label='# months' min={1} max={48} {...form.getInputProps('n_months')}/>
            </Grid.Col>
        </Grid>
        <SimpleGrid cols={1} breakpoints={[
            { minWidth: 'xs', cols: Math.min(2, form.values.n_months) },
            { minWidth: 'sm', cols: Math.min(3, form.values.n_months) },
            { minWidth: 'md', cols: Math.min(4, form.values.n_months) },
            { minWidth: 'lg', cols: Math.min(6, form.values.n_months) },
        ]}>
            {
                form.values.currency_id &&
                Array(form.values.n_months).fill(0).map((_, i) =>
                    <Stack key={i}>
                        <Center>
                            <Title order={4}>{DateTime.now().startOf('month').minus(Duration.fromObject({ months: i })).toFormat('MMMM yy')}</Title>
                        </Center>
                        <FinnanceSunburst size={Math.min(Math.max(isPhone ? 300 : 150, 0.8 * width / form.values.n_months), 500)} currency_id={form.values.currency_id}
                            min_date={DateTime.now().startOf('month').minus(Duration.fromObject({ months: i }))}
                            max_date={DateTime.now().endOf('month').minus(Duration.fromObject({ months: i }))}
                        />
                    </Stack>
                )
            }
        </SimpleGrid>

    </>
}