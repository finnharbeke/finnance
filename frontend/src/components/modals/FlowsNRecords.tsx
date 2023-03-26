import { ActionIcon, Autocomplete, Button, Grid, Input, NumberInput, Select, Switch, useMantineTheme } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { TbArrowWaveRightUp, TbEraser, TbTrendingDown, TbTrendingUp } from "react-icons/tb";
import { CurrencyFlat } from "../../Types/Currency";
import { Flow, FormValues, isFlow, isRecord, Record, transformedFormValues } from "./Transaction";
import { useAgents, useCategories } from "../../hooks/useQuery";
import AmountInput from "../Inputs/AmountInput";

interface FlowsNRecordsButtonProps {
    form: UseFormReturnType<FormValues, (vals: FormValues) => transformedFormValues>
}

function FlowsNRecordsButtons(props: FlowsNRecordsButtonProps) {
    const { form } = props;
    const theme = useMantineTheme();
    return <Input.Wrapper
        label='add records & flows | direct flow'
        withAsterisk
        {...form.getInputProps('isDirect')}
    >
        <Grid>
            <Grid.Col span='auto'>
                <Button
                    fullWidth variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                    leftIcon={
                        form.values.isExpense ? <TbTrendingDown size={24} /> : <TbTrendingUp size={24} />
                    }
                    disabled={form.values.isDirect}
                    onClick={() => {
                        form.clearFieldError('isDirect');
                        const item: Record = {
                            type: 'record',
                            ix: form.values.n_records,
                            amount: null,
                            category_id: null
                        };
                        form.insertListItem('items', item);
                        form.setFieldValue('n_records', form.values.n_records + 1)
                    }}
                >
                    Add Record
                </Button>
            </Grid.Col>
            <Grid.Col span='auto'>
                <Button
                    fullWidth variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                    leftIcon={<TbArrowWaveRightUp size={24} />}
                    disabled={form.values.isDirect} color='pink'
                    onClick={() => {
                        form.clearFieldError('isDirect');
                        const item: Flow = {
                            type: 'flow',
                            ix: form.values.n_flows,
                            amount: null,
                            agent: ''
                        };
                        form.insertListItem('items', item)
                        form.setFieldValue('n_flows', form.values.n_flows + 1)
                    }}
                >
                    Add Flow
                </Button>
            </Grid.Col>
            <Grid.Col span='content'>
                <Switch
                    size='lg' color='pink'
                    onLabel={<TbArrowWaveRightUp size={24}/>}
                    offLabel={<TbArrowWaveRightUp size={24}/>}
                    checked={form.values.isDirect}
                    onChange={() => form.setFieldValue('isDirect', !form.values.isDirect)}
                />
            </Grid.Col>
        </Grid>
    </Input.Wrapper>
}

interface FlowInputProps {
    flow: Flow
    form: UseFormReturnType<FormValues, (vals: FormValues) => transformedFormValues>
    i: number
    currency: CurrencyFlat
}

function FlowInput(props: FlowInputProps) {
    const theme = useMantineTheme();
    const { form, i, flow, currency } = props;
    const agents = useAgents();
    return <Grid>
        <Grid.Col span={4}>
            <AmountInput
                label={`#${i} flow`} withAsterisk
                currency={currency}
                {...form.getInputProps(`items.${i}.amount`)}
            />
        </Grid.Col>
        <Grid.Col span={8}>
            <Input.Wrapper label='agent' withAsterisk>
                <Grid>
                    <Grid.Col span='auto'>
                        <Autocomplete
                            placeholder={`Agent #${flow.ix}`}
                            data={agents.isLoading ? [] : agents.data.map(
                                agent => agent.desc
                            )}
                            {...form.getInputProps(`items.${i}.agent`)}
                        />
                    </Grid.Col>
                    <Grid.Col span='content'>
                        <ActionIcon
                            color="red" size='lg' variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                            onClick={() => {
                                form.values.items.forEach(
                                    (item, ix) => {
                                        if (isFlow(item) && item.ix > flow.ix)
                                            form.setFieldValue(`items.${ix}.ix`, item.ix - 1)
                                    }
                                )
                                form.removeListItem('items', i);
                                form.setFieldValue('n_flows', form.values.n_flows - 1)
                            }}>
                            <TbEraser size={18} />
                        </ActionIcon>
                    </Grid.Col>
                </Grid>
            </Input.Wrapper>
        </Grid.Col>
    </Grid>
}

interface RecordInputProps {
    record: Record
    form: UseFormReturnType<FormValues, (vals: FormValues) => transformedFormValues>
    i: number
    currency: CurrencyFlat
}

function RecordInput(props: RecordInputProps) {
    const theme = useMantineTheme();
    const { form, record, currency, i } = props;
    const categories = useCategories();

    return <Grid>
        <Grid.Col span={4}>
            <AmountInput
                label={`#${i} record`} withAsterisk
                currency={currency}
                {...form.getInputProps(`items.${i}.amount`)}
            />
        </Grid.Col>
        <Grid.Col span={8}>
            <Input.Wrapper label='category' withAsterisk>
                <Grid>
                    <Grid.Col span='auto'>
                        <Select
                            placeholder={`Category #${record.ix}`}
                            data={categories.isLoading ? [] : categories.data.filter(
                                cat => cat.usable && cat.is_expense === form.values.isExpense
                            ).map(
                                cat => ({
                                    value: cat.id,
                                    label: cat.desc,
                                    group: cat.parent_id === null ? cat.desc : cat.parent.desc
                                })
                            )}
                            {...form.getInputProps(`items.${i}.category_id`)}
                        />
                    </Grid.Col>
                    <Grid.Col span='content'>
                        <ActionIcon
                            color="red" size='lg' variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                            onClick={() => {
                                form.values.items.forEach(
                                    (item, ix) => {
                                        if (isRecord(item) && item.ix > record.ix)
                                            form.setFieldValue(`items.${ix}.ix`, item.ix - 1)
                                    }
                                )
                                form.removeListItem('items', i);
                                form.setFieldValue('n_records', form.values.n_records - 1)
                            }}>
                            <TbEraser size={18} />
                        </ActionIcon>
                    </Grid.Col>
                </Grid>
            </Input.Wrapper>
        </Grid.Col>
    </Grid>
}

interface FlowsNRecordsProps {
    form: UseFormReturnType<FormValues, (vals: FormValues) => transformedFormValues>
    currency: CurrencyFlat
}

export default function FlowsNRecordsInput(props: FlowsNRecordsProps) {

    const { form, currency } = props;

    return <>
        <FlowsNRecordsButtons form={form} />
        {
            !form.values.isDirect && form.values.items.map((data, i) =>
                isFlow(data) ?
                    <FlowInput form={form} currency={currency} flow={data} i={i} key={i} />
                    :
                    <RecordInput form={form} currency={currency} record={data} i={i} key={i} />
            )
        }

    </>

}