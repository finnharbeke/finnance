import { openContextModal } from "@mantine/modals";
import { AddTransactionModalProps } from "../components/transaction/TransactionModal";
import { AddTransferModalProps } from "../components/transfer/TransferModal";
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

export const addTransactionAction = async (props: AddTransactionModalProps) =>
    openContextModal({
        modal: 'add_transaction',
        title: 
        props.account ? `new transaction - ${props.account.desc}`
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
        innerProps: {is_expense}
    });