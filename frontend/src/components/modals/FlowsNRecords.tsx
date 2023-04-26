import { Button, ButtonProps, Grid, Input, Switch, useMantineTheme } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { TbArrowWaveRightUp, TbEraser, TbTrendingDown, TbTrendingUp } from "react-icons/tb";
import { CurrencyFlat } from "../../Types/Currency";
import { RedIcon } from "../Icons";
import AgentInput from "../input/AgentInput";
import AmountInput from "../input/AmountInput";
import CategoryInput from "../input/CategoryInput";
import { Flow, FormValues, Record, isFlow, isRecord, transformedFormValues } from "./TransactionModal";

interface FlowsNRecordsButtonProps extends ButtonProps {
    form: UseFormReturnType<FormValues, (vals: FormValues) => transformedFormValues>
}

const FlowsNRecordsButtons = ({ form, ...other }: FlowsNRecordsButtonProps) => {
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
                    color='pink'
                    onLabel={<TbArrowWaveRightUp size={32} />}
                    offLabel={<TbArrowWaveRightUp size={32} />}
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
}

const FlowInput = ({ form, i, flow, currency }: FlowInputProps) =>
    <Grid align='flex-end'>
        <Grid.Col span={4}>
            <AmountInput
                label={`#${i} flow`} withAsterisk
                currency={currency}
                {...form.getInputProps(`items.${i}.amount`)}
            />
        </Grid.Col>
        <Grid.Col span='auto'>
            <AgentInput label='agent' withAsterisk withinPortal placeholder={`Agent #${flow.ix}`}
                {...form.getInputProps(`items.${i}.agent`)}
            />
        </Grid.Col>
        <Grid.Col span='content'>
            <RedIcon icon={TbEraser}
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

interface RecordInputProps {
    record: Record
    form: UseFormReturnType<FormValues, (vals: FormValues) => transformedFormValues>
    i: number
    currency?: CurrencyFlat
}

const RecordInput = ({ form, record, currency, i }: RecordInputProps) =>
    <Grid align='flex-end'>
        <Grid.Col span={4}>
            <AmountInput
                label={`#${i} record`} withAsterisk
                currency={currency}
                {...form.getInputProps(`items.${i}.amount`)}
            />
        </Grid.Col>
        <Grid.Col span='auto'>
            <CategoryInput is_expense={form.values.isExpense}
                label='category' withAsterisk withinPortal
                placeholder={`Category #${record.ix}`}
                {...form.getInputProps(`items.${i}.category_id`)}
            />
        </Grid.Col>
        <Grid.Col span='content'>
            <RedIcon
                icon={TbEraser}
                onClick={() => {
                    form.values.items.forEach(
                        (item, ix) => {
                            if (isRecord(item) && item.ix > record.ix)
                                form.setFieldValue(`items.${ix}.ix`, item.ix - 1);
                        }
                    );
                    form.removeListItem('items', i);
                    form.setFieldValue('n_records', form.values.n_records - 1);
                }} />

        </Grid.Col>
    </Grid>

interface FlowsNRecordsProps {
    form: UseFormReturnType<FormValues, (vals: FormValues) => transformedFormValues>
    currency?: CurrencyFlat
}

const FlowsNRecordsInput = ({ form, currency }: FlowsNRecordsProps) =>
    <>
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


export default FlowsNRecordsInput;