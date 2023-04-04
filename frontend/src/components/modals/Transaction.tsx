import { Autocomplete, Button, Divider, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { OpenContextModal } from "@mantine/modals/lib/context";
import { DateTime, Duration } from "luxon";
import { useAddTransaction } from "../../hooks/useMutation";
import { useAgents } from "../../hooks/useQuery";
import { AccountDeep } from "../../Types/Account";
import { CurrencyFlat } from "../../Types/Currency";
import DateTimeInput from "./DateTimeInput";
import FlowsNRecordsInput from "./FlowsNRecords";
import AmountInput from "./TransactionAmountInput";

type OpenTransactionModalProps = {
    currency?: CurrencyFlat,
    account?: AccountDeep
}

type TransactionModalProps = {
    currency?: CurrencyFlat,
    account?: AccountDeep,
}

export const openTransactionModal = async (props: OpenContextModal<OpenTransactionModalProps>) => {
    openContextModal({
        ...{
            modal: 'transaction',
            title: 'new transaction',
            size: 'lg'
        },
        ...props,
        innerProps: props.innerProps
    })
}

interface RecordPost {
    amount: number,
    category_id: string,
}

export interface Record extends RecordPost {
    type: 'record'
    ix: number
}

interface FlowPost {
    amount: number,
    agent: string,
}

export interface Flow extends FlowPost {
    type: 'flow'
    ix: number
}

export type Item = Record | Flow;

export const isFlow = (val: Item): val is Flow => val.type === 'flow';
export const isRecord = (val: Item): val is Record => val.type === 'record';

export interface FormValues {
    account_id: number | undefined
    date: Date
    time: string
    amount: number
    isExpense: boolean
    agent: string
    isDirect: boolean
    n_flows: number
    n_records: number
    items: Item[]
    comment: string
}

export interface transformedFormValues {
    account_id: number | undefined
    date_issued: string
    amount: number
    is_expense: boolean
    agent: string
    comment: string
    flows: {
        amount: number
        agent: string
    }[],
    records: {
        amount: number
        category_id: number
    }[]
}

type Transform = (values: FormValues) => transformedFormValues

export const TransactionModal = ({ context, id, innerProps }: ContextModalProps<TransactionModalProps>) => {
    const { currency, account } = innerProps;

    const agents = useAgents();

    const form = useForm<FormValues, Transform>({
        initialValues: {
            account_id: account?.id,
            date: new Date(),
            time: DateTime.now().toFormat("HH:mm"),
            amount: 0,
            isExpense: true,
            agent: '',
            isDirect: false,
            n_flows: 0,
            n_records: 0,
            items: [],
            comment: '',
        },
        validate: {
            date: val => val === null ? 'choose date' : null,
            time: (val, vals) => val === null ? 'choose time' :
                DateTime.fromJSDate(vals.date).hasSame(DateTime.now(), 'day') && DateTime.now() < DateTime.fromFormat(val, "HH:mm") ?
                    'in the future' : null,
            agent: desc => desc.length === 0 ? "at least one character" : null,
            amount: val => val === null ? 'enter amount' : val === 0 ? 'non-zero amount' : null,
            // count flows
            isDirect: (val, vals) => !val && vals.items.length === 0 ? 'minimum one record / flow' : null,
            items: {
                agent: (desc, values, path) => {
                    const i = parseInt(path.replace(/^\D+/g, ''));
                    if (values.isDirect || !isFlow(values.items[i]))
                        return null;
                    if (desc.length === 0)
                        return 'at least one character';
                    for (let j = 0; j < i; j++) {
                        const item = values.items[j];
                        if (isFlow(item) && item.agent === desc)
                            return 'duplicate agent';
                    }
                    return null;
                },
                category_id: (id, values, path) => {
                    const i = parseInt(path.replace(/^\D+/g, ''));
                    if (values.isDirect || isFlow(values.items[i]))
                        return null;
                    if (id === null)
                        return 'select category';
                    for (let j = 0; j < i; j++) {
                        const item = values.items[j];
                        if (!isFlow(item) && item.category_id === id)
                            return 'duplicate category';
                    }
                    return null;
                },
                // records & flows amounts
                amount: (value, values, path) => {
                    if (values.isDirect)
                        return null;
                    if (value === null)
                        return 'enter amount';
                    if (value === 0)
                        return 'non-zero amount';
                    const i = parseInt(path.replace(/^\D+/g, ''));
                    let sum = 0;
                    for (let j = 0; j <= i; j++)
                        sum += values.items[j].amount;
                    if (values.amount === null || sum > values.amount)
                        return 'exceeds total';
                    if (i === values.items.length - 1 && sum < values.amount)
                        return 'less than total';
                    return null;
                }
            }
        },
        transformValues: (values: FormValues) => ({
            account_id: values.account_id,
            amount: values.amount,
            is_expense: values.isExpense,
            agent: values.agent,
            comment: values.comment,
            date_issued: DateTime.fromJSDate(values.date).startOf('day').plus(Duration.fromObject({
                hour: DateTime.fromFormat(values.time, "HH:mm").hour,
                minute: DateTime.fromFormat(values.time, "HH:mm").minute
            })).toISO({ includeOffset: false }),
            flows: values.isDirect ?
                [{ amount: values.amount, agent: values.agent }]
                :
                values.items.filter(isFlow)
                    .map(item => ({
                        amount: item.amount,
                        agent: item.agent
                    })),
            records: values.isDirect ?
                [] : values.items.filter(isRecord)
                    .map(item => ({
                        amount: item.amount,
                        category_id: parseInt(item.category_id)
                    }))
        })
    });
    // TODO: let react router know of the change

    const addTrans = useAddTransaction()
    
    const submitForm = (vals: transformedFormValues) => {
        addTrans.mutateAsync(vals);
        context.closeModal(id);
    }

    return <form onSubmit={form.onSubmit(submitForm)}>
        <DateTimeInput form={form} minDate={account?.date_created} />
        <AmountInput form={form} currency={currency} />
        <Autocomplete
            withAsterisk label='agent'
            data={agents.isLoading || agents.data === undefined ? [] : agents.data.map(
                agent => agent.desc
            )}
            {...form.getInputProps('agent')}
        />
        <Divider my='sm' />
        <FlowsNRecordsInput form={form} currency={currency} />
        <Divider my='sm' />
        <TextInput label='comment' {...form.getInputProps('comment')} />
        <Button fullWidth mt="md" type='submit'>
            add transaction
        </Button>
    </form >

};
