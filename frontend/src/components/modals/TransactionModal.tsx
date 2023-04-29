import { Button, Divider, TextInput } from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { OpenContextModal } from "@mantine/modals/lib/context";
import { DateTime } from "luxon";
import { useState } from "react";
import { AccountDeepQueryResult } from "../../types/Account";
import { TransactionRequest, useAddTransaction, useTransactionForm, useTransactionFormValues } from "../../types/Transaction";
import AgentInput from "../input/AgentInput";
import DateTimeInput from "../input/DateTimeInput";
import FlowsNRecordsInput from "./FlowsNRecords";
import AmountInput from "./TransactionAmountInput";

type TransactionModalProps = {
    account: AccountDeepQueryResult,
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

export const TransactionModal = ({ context, id, innerProps: { account } }: ContextModalProps<TransactionModalProps>) => {
    const initial = useTransactionFormValues(undefined, account);
    const form = useTransactionForm(initial);

    const addTrans = useAddTransaction();

    const [loading, setLoading] = useState(false);

    const submitForm = (vals: TransactionRequest) => {
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
