import { ActionIcon, Autocomplete, Button, ButtonProps, Grid, Input, MantineSize, Select, Switch, useMantineTheme } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { TbArrowWaveRightUp, TbEraser, TbTrendingDown, TbTrendingUp } from "react-icons/tb";
import { useAgents, useCategories } from "../../hooks/useQuery";
import { CurrencyFlat } from "../../Types/Currency";
import AmountInput from "../Inputs/AmountInput";
import { RedIcon } from "../Inputs/Icons";
import { Flow, FormValues, isFlow, isRecord, Record, transformedFormValues } from "./Transaction";

interface FlowsNRecordsButtonProps extends ButtonProps {
    form: UseFormReturnType<FormValues, (vals: FormValues) => transformedFormValues>
}

function FlowsNRecordsButtons({ form, ...other }: FlowsNRecordsButtonProps) {
    const theme = useMantineTheme();
    return <Input.Wrapper
        label='add records & flows | direct flow'
        withAsterisk
        {...form.getInputProps('isDirect')}
    >
        <Grid>
            <Grid.Col xs='auto' span={12}>
                <Button
                    fullWidth variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                    leftIcon={
                        form.values.isExpense ? <TbTrendingDown size={32} /> : <TbTrendingUp size={32} />
                    }
                    disabled={form.values.isDirect}
                    onClick={() => {
                        form.clearFieldError('isDirect');
                        const item: Record = {
                            type: 'record',
                            ix: form.values.n_records,
                            amount: 0,
                            category_id: ""
                        };
                        form.insertListItem('items', item);
                        form.setFieldValue('n_records', form.values.n_records + 1)
                    }}
                    {...other}
                >
                    record
                </Button>
            </Grid.Col>
            <Grid.Col span='auto'>
                <Button
                    fullWidth variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                    leftIcon={<TbArrowWaveRightUp size={32} />}
                    disabled={form.values.isDirect} color='pink'
                    onClick={() => {
                        form.clearFieldError('isDirect');
                        const item: Flow = {
                            type: 'flow',
                            ix: form.values.n_flows,
                            amount: 0,
                            agent: ''
                        };
                        form.insertListItem('items', item)
                        form.setFieldValue('n_flows', form.values.n_flows + 1)
                    }}
                    {...other}
                >
                    flow
                </Button>
            </Grid.Col>
            <Grid.Col span='content'>
                <Switch
                    size='xl' color='pink'
                    onLabel={<TbArrowWaveRightUp size={32}/>}
                    offLabel={<TbArrowWaveRightUp size={32}/>}
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
    currency?: CurrencyFlat
    size: MantineSize
}

function FlowInput({ form, i, flow, currency, size }: FlowInputProps) {
    const agents = useAgents();
    return <Grid>
        <Grid.Col span={4}>
            <AmountInput
                label={`#${i} flow`} withAsterisk
                currency={currency}
                {...form.getInputProps(`items.${i}.amount`)}
                size={size}
            />
        </Grid.Col>
        <Grid.Col span={8}>
            <Input.Wrapper label='agent' withAsterisk>
                <Grid>
                    <Grid.Col span='auto'>
                        <Autocomplete
                            placeholder={`Agent #${flow.ix}`}
                            data={agents.isLoading || !agents.data ? [] : agents.data.map(
                                agent => agent.desc
                            )}
                            size={size}
                            {...form.getInputProps(`items.${i}.agent`)}
                        />
                    </Grid.Col>
                    <Grid.Col span='content'>
                        <RedIcon icon={TbEraser} size={'lg'}
                            onClick={() => {
                                form.values.items.forEach(
                                    (item, ix) => {
                                        if (isFlow(item) && item.ix > flow.ix)
                                            form.setFieldValue(`items.${ix}.ix`, item.ix - 1)
                                    }
                                )
                                form.removeListItem('items', i);
                                form.setFieldValue('n_flows', form.values.n_flows - 1)
                            }} />
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
    currency?: CurrencyFlat
    size: MantineSize
}

function RecordInput({ form, record, currency, i, size }: RecordInputProps) {
    const theme = useMantineTheme();
    const categories = useCategories();

    return <Grid>
        <Grid.Col span={4}>
            <AmountInput
                label={`#${i} record`} withAsterisk
                currency={currency}
                {...form.getInputProps(`items.${i}.amount`)}
                size={size}
            />
        </Grid.Col>
        <Grid.Col span={8}>
            <Input.Wrapper label='category' withAsterisk>
                <Grid>
                    <Grid.Col span='auto'>
                        <Select
                            placeholder={`Category #${record.ix}`}
                            data={categories.isLoading || !categories.data ? [] : categories.data.filter(
                                cat => cat.usable && cat.is_expense === form.values.isExpense
                            ).map(
                                cat => ({
                                    value: cat.id.toFixed(0),
                                    label: cat.desc,
                                    group: cat.parent_id === null ? cat.desc : cat.parent.desc
                                })
                            )}
                            size={size}
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
    currency?: CurrencyFlat
    size: MantineSize
}

export default function FlowsNRecordsInput({ form, currency, size }: FlowsNRecordsProps) {
    return <>
        <FlowsNRecordsButtons form={form} size={size}/>
        {
            !form.values.isDirect && form.values.items.map((data, i) =>
                isFlow(data) ?
                    <FlowInput form={form} currency={currency} flow={data} i={i} key={i} size={size}/>
                    :
                    <RecordInput form={form} currency={currency} record={data} i={i} key={i} size={size}/>
            )
        }

    </>

}