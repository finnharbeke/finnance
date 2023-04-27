import { Button, Divider, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { OpenContextModal } from "@mantine/modals/lib/context";
import { DateTime, Duration } from "luxon";
import { useState } from "react";
import { AccountDeep } from "../../Types/Account";
import { useAddTransaction } from "../../hooks/api/useMutation";
import DateTimeInput from "../input/DateTimeInput";
import AgentInput from "../input/AgentInput";
import FlowsNRecordsInput from "./FlowsNRecords";
import AmountInput from "./TransactionAmountInput";

type TransactionModalProps = {
    // currency?: CurrencyFlat,
    account: AccountDeep,
}

export const openTransactionModal = async (props: OpenContextModal<TransactionModalProps>) => {
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
    amount: number | "",
    category_id: string,
}

export interface Record extends RecordPost {
    type: 'record'
    ix: number
}

interface FlowPost {
    amount: number | "",
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
    account_id: number | undefined
    date: Date
    time: string
    amount: number | ""
    isExpense: boolean
    agent: string
    isDirect: boolean
    n_flows: number
    n_records: number
    items: Item[]
    comment: string
}

export interface transformedFormValues {
    account_id: number | undefined
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

export const TransactionModal = ({ context, id, innerProps: { account } }: ContextModalProps<TransactionModalProps>) => {
    const form = useForm<FormValues, Transform>({
        initialValues: {
            account_id: account?.id,
            date: new Date(),
            time: DateTime.now().toFormat("HH:mm"),
            amount: "",
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
                    if (value === "")
                        return 'enter amount';
                    if (value === 0)
                        return 'non-zero amount';
                    const i = parseInt(path.replace(/^\D+/g, ''));
                    let sum = 0;
                    for (let j = 0; j <= i; j++) {
                        const jthAmount = values.items[j].amount;
                        sum += (jthAmount === "" ? 0 : jthAmount);
                    }
                    if (values.amount === "" || sum > values.amount)
                        return 'exceeds total';
                    if (i === values.items.length - 1 && sum < values.amount)
                        return 'less than total';
                    return null;
                }
            }
        },
        transformValues: (values: FormValues) => ({
            account_id: values.account_id,
            is_expense: values.isExpense,
            agent: values.agent,
            comment: values.comment,
            date_issued: DateTime.fromJSDate(values.date).startOf('day').plus(Duration.fromObject({
                hour: DateTime.fromFormat(values.time, "HH:mm").hour,
                minute: DateTime.fromFormat(values.time, "HH:mm").minute
            })).toISO({ includeOffset: false }),
            flows: values.isDirect ?
                [{ amount: values.amount ? values.amount : 0, agent: values.agent }]
                :
                values.items.filter(isFlow)
                    .map(item => ({
                        amount: item.amount ? item.amount : 0,
                        agent: item.agent
                    })),
            records: values.isDirect ?
                [] : values.items.filter(isRecord)
                    .map(item => ({
                        amount: item.amount ? item.amount : 0,
                        category_id: parseInt(item.category_id)
                    })),
            amount: values.amount ? values.amount : 0,
        })
    });

    const addTrans = useAddTransaction()

    const [loading, setLoading] = useState(false);

    const submitForm = (vals: transformedFormValues) => {
        setLoading(true);
        addTrans.mutateAsync(vals, {
            onSuccess: () => context.closeModal(id),
            onSettled: () => setLoading(false)
        });
    }

    return <form onSubmit={form.onSubmit(submitForm)}>
        <DateTimeInput form={form}
            minDate={account ? DateTime.fromISO(account?.date_created).toJSDate() : undefined} />
        <AmountInput form={form} currency={account.currency} />
        <AgentInput label='agent' withAsterisk withinPortal
            {...form.getInputProps('agent')}
        />
        <Divider my='sm' />
        <FlowsNRecordsInput form={form} currency={account.currency} />
        <Divider my='sm' />
        <TextInput label='comment' {...form.getInputProps('comment')} />
        <Button fullWidth mt="md" type='submit' loading={loading} >
            add transaction
        </Button>
    </form >

};
