import { Alert, Center, Grid, NumberInput, SimpleGrid, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useColorScheme, useElementSize } from "@mantine/hooks";
import { DateTime, Duration } from "luxon";
import { TbAlertCircle } from "react-icons/tb";
import CurrencyInput from "../components/input/CurrencyInput";
import useIsPhone from "../hooks/useIsPhone";
import FinnanceSunburst from "./Sunburst";

interface FormValues {
    currency_id: string
    latest: Date
    n_rows: number
    n_cols: number
}

export default function NivoPage() {
    const isPhone = useIsPhone();
    const theme = useMantineTheme();

    const form = useForm<FormValues>({
        initialValues: {
            currency_id: '',
            latest: new Date(),
            n_cols: isPhone ? 2 : 3,
            n_rows: isPhone ? 3 : 2
        }
    })

    const total = form.values.n_cols * form.values.n_rows;

    return <>
        <Grid>
            <Grid.Col span={6} md={3}>
                <CurrencyInput hasDefault label='currency' {...form.getInputProps('currency_id')} />
            </Grid.Col>
            <Grid.Col span={6} md={3}>
                <MonthPickerInput label='until' maxDate={new Date()} {...form.getInputProps('latest')} />
            </Grid.Col>
            <Grid.Col span={6} md={3}>
                <NumberInput label='# rows' min={1} max={isPhone ? 15 : 10} {...form.getInputProps('n_rows')} />
            </Grid.Col>
            <Grid.Col span={6} md={3}>
                <NumberInput label='# columns' min={1} max={isPhone ? 4 : 6} {...form.getInputProps('n_cols')} />
            </Grid.Col>
        </Grid>
        {
            total >= 20 &&
            <Alert variant={theme.colorScheme === 'dark' ? 'outline' : 'light'} mt='sm'
                icon={<TbAlertCircle />} color="yellow"
                title='careful! the site may get slow or unresponsive with too many graphs'>
            </Alert>
        }
        <SimpleGrid mt='md' cols={form.values.n_cols}>
            {
                form.values.currency_id &&
                Array(form.values.n_rows * form.values.n_cols).fill(0).map((_, i) =>
                    <Cell key={i} offset={i} values={form.values}/>
                )
            }
        </SimpleGrid>

    </>
}

const Cell = ({ offset, values }: { offset: number, values: FormValues }) => {
    const { ref, width } = useElementSize();
    return <Stack ref={ref}>
        <Center>
            <Title order={4}>{DateTime.fromJSDate(values.latest).startOf('month').minus(Duration.fromObject({ months: offset })).toFormat('MMM yy')}</Title>
        </Center>
        <FinnanceSunburst size={Math.min(width, 700)} currency_id={values.currency_id}
            min_date={DateTime.fromJSDate(values.latest).startOf('month').minus(Duration.fromObject({ months: offset }))}
            max_date={DateTime.fromJSDate(values.latest).endOf('month').minus(Duration.fromObject({ months: offset }))}
        />
    </Stack>
}