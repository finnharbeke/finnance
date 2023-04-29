import { Button, Divider, TextInput } from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { OpenContextModal } from "@mantine/modals/lib/context";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { AccountDeepQueryResult } from "../../types/Account";
import { useCategories } from "../../types/Category";
import { CurrencyQueryResult, useCurrencies } from "../../types/Currency";
import { TransactionFormType, TransactionRequest, useAddTransaction, useEditTransaction, useTransaction, useTransactionForm, useTransactionFormValues } from "../../types/Transaction";
import Placeholder from "../Placeholder";
import AgentInput from "../input/AgentInput";
import CurrencyInput from "../input/CurrencyInput";
import DateTimeInput from "../input/DateTimeInput";
import FlowsNRecordsInput from "./FlowsNRecords";
import AmountInput from "./TransactionAmountInput";

interface TransactionFormProps {
    account?: AccountDeepQueryResult
    form: TransactionFormType
}

const TransactionForm = ({ account, form }: TransactionFormProps) => {
    const query = useCurrencies();
    // so that it's already loaded for records
    // eslint-disable-next-line
    const preQuery = useCategories();

    if (!query.isSuccess)
        return <Placeholder queries={[query]} height={400} />

    const currencies = query.data;

    const currency = currencies.reduce<CurrencyQueryResult | undefined>(
        (prev, curr) => curr.id.toString() === form.values.currency_id ?
            curr : prev, undefined
    );
    return <>
        {
            form.values.account_id === null &&
            <>
                <AgentInput label='transaction via' withAsterisk placeholder="my friend tom"
                    {...form.getInputProps('remote_agent')}
                />
                <CurrencyInput label='currency' withAsterisk hasDefault mb='md'
                    {...form.getInputProps('currency_id')}
                />
            </>
        }
        <DateTimeInput form={form}
            minDate={account ? DateTime.fromISO(account?.date_created).toJSDate() : undefined} />
        <AmountInput form={form} currency={currency} />
        <AgentInput label='agent' withAsterisk withinPortal
            {...form.getInputProps('agent')}
        />
        <Divider my='sm' />
        <FlowsNRecordsInput form={form} currency={currency} />
        <Divider my='sm' />
        <TextInput label='comment' {...form.getInputProps('comment')} />
    </>
}

type AddTransactionModalProps = {
    account?: AccountDeepQueryResult,
}

export const openAddTransactionModal = async (props: OpenContextModal<AddTransactionModalProps>) => {
    openContextModal({
        ...{
            modal: 'add_transaction',
            title: 'new transaction',
            size: 'lg'
        },
        ...props,
        innerProps: props.innerProps
    })
}

export const AddTransactionModal = ({ context, id, innerProps: { account } }: ContextModalProps<AddTransactionModalProps>) => {

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
        <TransactionForm form={form} account={account} />
        <Button fullWidth mt="md" type='submit' loading={loading} >
            add transaction
        </Button>
    </form >

};

type EditTransactionModalProps = {
    transaction_id: number
}

export const openEditTransactionModal = async (props: OpenContextModal<EditTransactionModalProps>) => {
    openContextModal({
        ...{
            modal: 'edit_transaction',
            title: 'edit transaction',
            size: 'lg'
        },
        ...props,
    })
}

export const EditTransactionModal = ({ context, id, innerProps: { transaction_id } }: ContextModalProps<EditTransactionModalProps>) => {
    const query = useTransaction(transaction_id);

    const initial = useTransactionFormValues(query.data);

    // eslint-disable-next-line
    useEffect(() => form.setValues(initial), [initial]);

    const form = useTransactionForm(initial);

    const editTrans = useEditTransaction();

    const [loading, setLoading] = useState(false);

    const submitForm = (values: TransactionRequest) => {
        setLoading(true);
        editTrans.mutateAsync({ id: transaction_id, values }, {
            onSuccess: () => context.closeModal(id),
            onSettled: () => setLoading(false)
        });
    }

    if (!query.isSuccess)
        return <Placeholder height={500} queries={[query]} />

    return <form onSubmit={form.onSubmit(submitForm)}>
        <TransactionForm form={form} />
        <Button fullWidth mt="md" type='submit' loading={loading} >
            edit transaction
        </Button>
    </form >

};
