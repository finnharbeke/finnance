import { Button, Divider, Popover, Text, TextInput } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { AccountDeepQueryResult, useAccounts } from "../../types/Account";
import { CurrencyQueryResult, useCurrencies } from "../../types/Currency";
import { TemplateDeepQueryResult } from "../../types/Template";
import { TransactionFormType, TransactionRequest, UseTransactionFormValuesProps, useAddTransaction, useDeleteTransaction, useEditTransaction, useTransaction, useTransactionForm, useTransactionFormValues } from "../../types/Transaction";
import Placeholder from "../Placeholder";
import AccountSelect from "../input/AccountInput";
import AgentInput from "../input/AgentInput";
import CurrencyInput from "../input/CurrencyInput";
import DateTimeInput from "../input/DateTimeInput";
import FlowsNRecordsInput from "./FlowsNRecords";
import AmountInput from "./TransactionAmountInput";

interface TransactionFormProps {
    edit?: boolean
    account_input?: boolean
    date_input?: boolean
    minDate?: Date
    form: TransactionFormType
    template?: boolean
}

export const TransactionForm = (props: TransactionFormProps) => {
    const { edit = false, account_input = false, minDate, form, date_input = true, template = false } = props;
    const currQuery = useCurrencies();
    const accQuery = useAccounts();

    const [currency, setCurrency] = useState<CurrencyQueryResult | undefined>();
    const [account, setAccount] = useState<AccountDeepQueryResult | undefined>();

    useEffect(() => setCurrency(
        (currQuery.data || []).reduce<CurrencyQueryResult | undefined>(
            (prev, current) => current.id.toString() === form.values.currency_id ?
                current : prev, undefined
        ))
        , [currQuery, form.values.currency_id])

    useEffect(() => setAccount(
        (accQuery.data || []).reduce<AccountDeepQueryResult | undefined>(
            (prev, current) => current.id.toString() === form.values.account_id ?
                current : prev, undefined
        )), [accQuery, form.values.account_id])

    useEffect(() => {
        if (account !== undefined)
            form.setFieldValue('currency_id', account.currency_id.toString())
        // eslint-disable-next-line
    }, [account])

    if (!currQuery.isSuccess || !accQuery.isSuccess)
        return <Placeholder queries={[accQuery, currQuery]} height={400} />

    return <>
        {
            (edit || account_input) &&
            <AccountSelect include_remote withAsterisk={!template}
                {...form.getInputProps('account_id')}
            />
        }
        {
            form.values.account_id === 'remote' &&
            <AgentInput label='transaction via' withAsterisk={!template} placeholder="my friend tom"
                {...form.getInputProps('remote_agent')}
            />
        }
        {
            form.values.account_id === 'remote' &&
            <CurrencyInput label='currency' withAsterisk={!template} hasDefault
                {...form.getInputProps('currency_id')}
            />
        }
        {
            (edit || account_input || form.values.account_id === 'remote'
                || form.values.account_id === null) &&
            <Divider mt='sm' />
        }
        {
            date_input &&
            <DateTimeInput form={form} minDate={minDate} withAsterisk={!template} />
        }
        <AmountInput form={form} currency={currency} withAsterisk={!template} />
        <AgentInput label='agent' withAsterisk={!template} comboboxProps={{ withinPortal: true }}
            {...form.getInputProps('agent')}
        />
        <Divider mt='sm' />
        <FlowsNRecordsInput form={form} currency={currency} withAsterisk={!template} />
        <Divider mt='sm' />
        <TextInput label='comment' {...form.getInputProps('comment')} />
    </>
}

export const AddTransactionModal = (
    { context, id, innerProps: props }: ContextModalProps<UseTransactionFormValuesProps>
) => {
    const { account, remote } = props;
    const initial = useTransactionFormValues(props);
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
        <TransactionForm form={form}
            minDate={account && DateTime.fromISO(account.date_created).toJSDate()}
            account_input={account === undefined && !remote}
        />
        <Button fullWidth mt="md" type='submit' loading={loading} >
            add transaction
        </Button>
    </form>

};

export interface FromTemplateModalProps {
    template: TemplateDeepQueryResult
}

export const FromTemplateModal = ({ context, id, innerProps: { template } }: ContextModalProps<FromTemplateModalProps>) => {

}

type EditTransactionModalProps = {
    transaction_id: number
}

export const EditTransactionModal = ({ context, id, innerProps: { transaction_id } }: ContextModalProps<EditTransactionModalProps>) => {
    const query = useTransaction(transaction_id);

    const initial = useTransactionFormValues({ trans: query.data });

    // eslint-disable-next-line
    useEffect(() => form.setValues(initial), [initial]);

    const form = useTransactionForm(initial);

    const editTrans = useEditTransaction();
    const delTrans = useDeleteTransaction(transaction_id);

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
        <TransactionForm form={form} edit />
        <Button fullWidth mt="md" type='submit' loading={loading} >
            edit transaction
        </Button>
        <Popover width='target'>
            <Popover.Target>
                <Button fullWidth mt="xl" color='red'
                    variant='light'>
                    delete transaction
                </Button>
            </Popover.Target>
            <Popover.Dropdown>
                <Text align='center' mb='sm'>are you sure?</Text>
                <Button fullWidth color='red' onClick={() => {
                    context.closeModal(id);
                    delTrans.mutateAsync(undefined, {
                        onSuccess: () => showNotification({
                            color: 'green',
                            message: `deleted transaction #${transaction_id}`,
                            autoClose: 2000
                        })
                    });
                }}>
                    delete
                </Button>
            </Popover.Dropdown>
        </Popover>
    </form >

};
