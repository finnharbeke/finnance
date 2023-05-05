import { Button, Flex, Grid, NumberInput, Paper, PaperProps, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CurrencyFormValues, CurrencyQueryResult, useAddCurrency } from "../types/Currency";

interface CurrencyCardProps extends PaperProps {
    currency: CurrencyQueryResult
};

export function CurrencyCard({ currency, ...others }: CurrencyCardProps) {
    const { code, decimals } = currency;

    return <Paper withBorder p='xs' {...others}>
        <Flex justify='space-between' align='center'>
            <Text><Text span fw={700}>{code}:</Text> {decimals} decimals</Text>
        </Flex>
    </Paper>
}

export function CurrencyForm({ ...others }: PaperProps) {
    const form = useForm<CurrencyFormValues>({
        initialValues: {
            code: '',
            decimals: 2,
        },
        validate: {
            code: value => value.length !== 3 ? "code must have length 3" : null
        }
    })

    const addCurrency = useAddCurrency();

    function handleSubmit(values: CurrencyFormValues) {
        addCurrency.mutateAsync(values);
    }

    return <Paper withBorder p='sm' {...others}>
        <Title order={3}>add currency</Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid align="flex-end">
                <Grid.Col sm={6} xs={12}>
                    <TextInput label="currency code" {...form.getInputProps('code')} />
                </Grid.Col>
                <Grid.Col sm={6} xs={12}>
                    <NumberInput
                        label="decimals"
                        precision={0}
                        min={0}
                        max={4}
                        {...form.getInputProps('decimals')}
                    />
                </Grid.Col>
                <Grid.Col span={12}>
                    <Button fullWidth type="submit">create</Button>
                </Grid.Col>
            </Grid>
        </form>
    </Paper>
}