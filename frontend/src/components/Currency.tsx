import { Button, Flex, Grid, MultiSelect, NumberInput, Paper, PaperProps, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CurrencyFormValues, CurrencyQueryResult, InitialCurrencyFormValues, INTERNATIONAL_CURRENCIES, useAddCurrency } from "../types/Currency";
import { useState } from "react";
import { ContextModalProps } from "@mantine/modals";

interface CurrencyCardProps extends PaperProps {
    currency: CurrencyQueryResult
};

export function CurrencyCard({ currency, ...others }: CurrencyCardProps) {
    const { code, decimals } = currency;

    return <Paper p='xs' {...others}>
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

    return <Paper p='sm' {...others}>
        <Title order={3}>add currency</Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid align="flex-end">
                <Grid.Col span={{ sm: 6, xs: 12 }}>
                    <TextInput label="currency code" {...form.getInputProps('code')} />
                </Grid.Col>
                <Grid.Col span={{ sm: 6, xs: 12 }}>
                    <NumberInput
                        label="decimals"
                        allowDecimal={false}
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

export function InitialCurrencyCreationModal({ context, id }: ContextModalProps<{}>) {
    const form = useForm<InitialCurrencyFormValues>({
        initialValues: {
            codes: []
        },
        validate: {
            codes: codes => codes.some(x => x.length !== 3) ? "codes must all have length 3" : null
        }
    })

    const [loading, setLoading] = useState(false);
    const addCurrency = useAddCurrency();

    function handleSubmit(values: InitialCurrencyFormValues) {
        setLoading(true);
        for (let i = 0; i < values.codes.length; i++) {
            let code = values.codes[i];
            for (let curr of INTERNATIONAL_CURRENCIES) {
                if (curr.code === code) {
                    if (i === values.codes.length - 1)
                        addCurrency.mutate(curr, {
                            onSuccess: () => {
                                console.log('close');
                                context.closeModal(id);
                            },
                            onSettled: () => setLoading(false)
                        })
                    else
                        addCurrency.mutateAsync(curr)
                }
            }
        }
    }

    const CODES = INTERNATIONAL_CURRENCIES.map(x => x.code);

    return <form onSubmit={form.onSubmit(handleSubmit)}>
        <Text size='sm' mb='sm'>To get started, select some currencies you're using. You can always add more later.</Text>
        <MultiSelect data={CODES} {...form.getInputProps('codes')} clearable searchable mb='sm' />
        <Button fullWidth type="submit" loading={loading}>create selected currencies</Button>
    </form>
}