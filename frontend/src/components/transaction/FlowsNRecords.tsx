import { Anchor, Button, ButtonProps, Collapse, Grid, Input, Switch, useMantineTheme } from "@mantine/core";
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
}

const FlowsNRecordsButtons = ({ form, ...other }: FlowsNRecordsButtonProps) => {
    const theme = useMantineTheme();
    return <Input.Wrapper
        label={
            form.values.account_id === null ?
                'add records'
                : 'add records & flows | direct flow'
        }
        withAsterisk
        {...form.getInputProps('direct')}
    >
        <Grid>
            <Grid.Col xs='auto' span={12}>
                <Button
                    fullWidth variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                    leftIcon={
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
                form.values.account_id !== null &&
                <Grid.Col span='auto'>
                    <Button
                        fullWidth variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                        leftIcon={<TbArrowWaveRightUp size={32} />}
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
                form.values.account_id !== null &&
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
}

const FlowInput = ({ form, i, flow, currency }: FlowInputProps) =>
    <Grid>
        <Grid.Col span={4}>
            <AmountInput
                label={`#${i} flow`} withAsterisk
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
            <AgentInput label='agent' withAsterisk withinPortal placeholder={`agent #${flow.ix}`}
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
}

const RecordInput = ({ form, record, currency, i }: RecordInputProps) =>
    <Grid>
        <Grid.Col span={4}>
            <AmountInput
                label={`#${i} record`} withAsterisk
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
            <CategoryInput is_expense={form.values.is_expense}
                label='category' withAsterisk withinPortal must_be_usable
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
}

const FlowsNRecordsInput = ({ form, currency }: FlowsNRecordsProps) => {
    const [hidden, setHidden] = useState(
        form.values.items.length <= 1
    );
    useEffect(() =>
        setHidden(form.values.items.length <= 1),
        [form.values.items.length, setHidden]
    )
    return <>
        <Collapse in={!hidden}>
            <FlowsNRecordsButtons form={form} />
        </Collapse>
        {
            !form.values.direct && form.values.items.map((data, i) =>
                isFlow(data) ?
                    <FlowInput form={form} currency={currency} flow={data} i={i} key={i} />
                    :
                    <RecordInput form={form} currency={currency} record={data} i={i} key={i} />
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