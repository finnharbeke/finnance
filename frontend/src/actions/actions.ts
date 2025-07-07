import { openContextModal } from "@mantine/modals";
import { AddTransferModalProps } from "../components/transfer/TransferModal";
import { UseTransactionFormValuesProps } from "../types/Transaction";
import { TransferQueryResult } from "../types/Transfer";

export const addAccountAction = async () =>
    openContextModal({
        modal: 'account',
        title: 'new account',
        innerProps: {}
    })

export const addTransferAction = async (props: AddTransferModalProps) =>
    openContextModal({
        modal: 'add_transfer',
        title: 'new account transfer',
        innerProps: props
    })

export const editTransferAction = async (data: TransferQueryResult) =>
    openContextModal({
        modal: 'edit_transfer',
        title: `edit transfer #${data.id}`,
        innerProps: {
            transfer: data
        }
    })

export const addTransactionAction = async (props: UseTransactionFormValuesProps) =>
    openContextModal({
        modal: 'add_transaction',
        title: props.template ?
            `new transaction - ${props.template.desc}`
            :
            props.account ?
                `new transaction - ${props.account.desc}`
                : `new ${props.remote ? 'remote ' : ''}transaction`,
        innerProps: props
    })

export const editTransactionAction = async (transaction_id: number) =>
    openContextModal({
        modal: 'edit_transaction',
        title: `edit transaction #${transaction_id}`,
        innerProps: { transaction_id }
    })

export const addCategoryAction = async (is_expense: boolean) =>
    openContextModal({
        modal: 'category',
        title: `new ${is_expense ? 'expense' : 'income'} category`,
        innerProps: { is_expense }
    });

export const addTemplateAction = async () =>
    openContextModal({
        modal: 'add_template',
        title: 'new template',
        innerProps: {}
    })

export const initialCurrenciesAction = async () =>
    openContextModal({
        modal: 'initial_currencies',
        title: 'create currencies',
        innerProps: {}
    })