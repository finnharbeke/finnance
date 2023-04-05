import { Button, Flex, Grid, NumberInput, Paper, PaperProps, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CurrencyFlat } from "../Types/Currency";
import { useAddCurrency } from "../hooks/api/useMutation";

interface CurrencyCardProps extends PaperProps {
    currency: CurrencyFlat
};

export function CurrencyCard({ currency, ...others }: CurrencyCardProps) {
    const { code, decimals } = currency;

    return <Paper withBorder p='xs' {...others}>
        <Flex justify='space-between' align='center'>
            <Text><Text span fw={700}>{code}:</Text> {decimals} decimals</Text>
            {/* <RedIcon icon={TbEraser}
                onClick={() => console.log('delete curr ', currency)}
                tooltip='delete'
            /> */}
        </Flex>
    </Paper>
}

export interface CurrencyFormValues {
    code: string
    decimals: number
}

export function CurrencyForm({ ...others }: PaperProps) {
    const form = useForm<CurrencyFormValues>({
        initialValues: {
            code: '',
            decimals: 0,
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