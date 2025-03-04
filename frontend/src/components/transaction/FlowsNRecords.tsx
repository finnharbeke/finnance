import { Anchor, Button, ButtonProps, Collapse, Grid, Input, Switch, useComputedColorScheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { TbArrowWaveRightUp, TbEraser, TbTrendingDown, TbTrendingUp } from "react-icons/tb";
import { CurrencyQueryResult } from "../../types/Currency";
import { FlowFormValues, emptyFlowFormValues, isFlow } from "../../types/Flow";
import { RecordFormValues, emptyRecordFormValues, isRecord } from "../../types/Record";
import { TransactionFormType } from "../../types/Transaction";
import { RedIcon } from "../Icons";
import AgentInput from "../input/AgentInput";
import AmountInput from "../input/AmountInput";
import CategoryInput from "../input/CategoryInput";

interface FlowsNRecordsButtonProps extends ButtonProps {
    form: TransactionFormType
    withAsterisk?: boolean
}

const FlowsNRecordsButtons = ({ form, withAsterisk, ...other }: FlowsNRecordsButtonProps) => {
    const colorScheme = useComputedColorScheme();
    return <Input.Wrapper
        label={
            form.values.account_id === 'remote' ?
                'add records'
                : 'add records & flows | direct flow'
        }
        withAsterisk={withAsterisk}
        {...form.getInputProps('direct')}
    >
        <Grid>
            <Grid.Col span={{xs: 'auto', base: 12}}>
                <Button
                    fullWidth variant={colorScheme === 'light' ? 'outline' : 'light'}
                    leftSection={
                        form.values.is_expense ? <TbTrendingDown size={32} /> : <TbTrendingUp size={32} />
                    }
                    disabled={form.values.direct}
                    onClick={() => {
                        form.clearFieldError('direct');
                        form.insertListItem('items', emptyRecordFormValues(form.values.n_records));
                        form.setFieldValue('n_records', form.values.n_records + 1);
                    }}
                    {...other}
                >
                    record
                </Button>
            </Grid.Col>
            {
                form.values.account_id !== 'remote' &&
                <Grid.Col span='auto'>
                    <Button
                        fullWidth variant={colorScheme === 'light' ? 'outline' : 'light'}
                        leftSection={<TbArrowWaveRightUp size={32} />}
                        disabled={form.values.direct} color='pink'
                        onClick={() => {
                            form.clearFieldError('direct');
                            form.insertListItem('items', emptyFlowFormValues(form.values.n_flows));
                            form.setFieldValue('n_flows', form.values.n_flows + 1);
                        }}
                        {...other}
                    >
                        flow
                    </Button>
                </Grid.Col>
            }
            {
                form.values.account_id !== 'remote' &&
                <Grid.Col span='content'>
                    <Switch
                        color='pink'
                        onLabel={<TbArrowWaveRightUp size={32} />}
                        offLabel={<TbArrowWaveRightUp size={32} />}
                        checked={form.values.direct}
                        onChange={() => form.setFieldValue('direct', !form.values.direct)}
                    />
                </Grid.Col>
            }
        </Grid>
    </Input.Wrapper>
}

interface FlowInputProps {
    flow: FlowFormValues
    form: TransactionFormType
    i: number
    currency?: CurrencyQueryResult
    withAsterisk?: boolean
}

const FlowInput = ({ form, i, flow, currency, withAsterisk }: FlowInputProps) =>
    <Grid>
        <Grid.Col span={4}>
            <AmountInput
                label={`#${i} flow`} withAsterisk={withAsterisk}
                showPrefix={false}
                currency={currency}
                {...form.getInputProps(`items.${i}.amount`)}
                onChange={val => {
                    form.setFieldValue(`items.${i}.amount`, val);
                    if (val !== '')
                        form.setFieldValue('last_update', i);
                }}
            />
        </Grid.Col>
        <Grid.Col span='auto'>
            <AgentInput label='agent' withAsterisk comboboxProps={{ withinPortal: true }} placeholder={`agent #${flow.ix}`}
                {...form.getInputProps(`items.${i}.agent`)}
            />
        </Grid.Col>
        <Grid.Col span='content'>
            <RedIcon icon={TbEraser} mt='1.5em'
                onClick={() => {
                    form.values.items.forEach(
                        (item, ix) => {
                            if (isFlow(item) && item.ix > flow.ix)
                                form.setFieldValue(`items.${ix}.ix`, item.ix - 1)
                        }
                    )
                    form.removeListItem('items', i);
                    form.setFieldValue('n_flows', form.values.n_flows - 1);
                }} />
        </Grid.Col>
    </Grid>

interface RecordInputProps {
    record: RecordFormValues
    form: TransactionFormType
    i: number
    currency?: CurrencyQueryResult
    withAsterisk?: boolean
}

const RecordInput = ({ form, record, currency, i, withAsterisk }: RecordInputProps) =>
    <Grid>
        <Grid.Col span={4}>
            <AmountInput
                label={`#${i} record`} withAsterisk={withAsterisk}
                currency={currency}
                {...form.getInputProps(`items.${i}.amount`)}
                onChange={val => {
                    form.setFieldValue(`items.${i}.amount`, val);
                    if (val !== '')
                        form.setFieldValue('last_update', i);
                }}
            />
        </Grid.Col>
        <Grid.Col span='auto'>
            <CategoryInput is_expense={form.values.is_expense}
                label='category' withAsterisk={withAsterisk} comboboxProps={{ withinPortal: true }} must_be_usable
                placeholder={`category #${record.ix}`}
                {...form.getInputProps(`items.${i}.category_id`)}
            />
        </Grid.Col>
        <Grid.Col span='content'>
            <RedIcon
                icon={TbEraser} mt='1.5em'
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
    form: TransactionFormType
    currency?: CurrencyQueryResult
    withAsterisk?: boolean
}

const FlowsNRecordsInput = ({ form, currency, withAsterisk }: FlowsNRecordsProps) => {
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        if (!form.isDirty() && (form.values.items.length === 1 && !form.values.direct))
            setHidden(true)
    }, [form, setHidden])

    return <>
        <Collapse in={!hidden}>
            <FlowsNRecordsButtons form={form} />
        </Collapse>
        {
            !form.values.direct && form.values.items.map((data, i) =>
                isFlow(data) ?
                    <FlowInput form={form} currency={currency} flow={data} withAsterisk={withAsterisk} i={i} key={i} />
                    :
                    <RecordInput form={form} currency={currency} record={data} withAsterisk={withAsterisk} i={i} key={i} />
            )
        }
        {
            hidden &&
            <Anchor align='right' onClick={() => setHidden(false)}>
                more...
            </Anchor>
        }
    </>
}

export default FlowsNRecordsInput;