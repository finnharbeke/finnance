import { TransactionDeep } from "./Transaction";
import { TransferDeep } from "./Transfer";

export interface AccountChangeTransfer {
    type: 'AccountChange',
    data: TransferDeep,
    acc_id: number,
    saldo: number
}

export interface AccountChangeTransaction {
    type: 'AccountChange',
    data: TransactionDeep,
    acc_id: number,
    saldo: number
}

export type AccountChange = AccountChangeTransfer | AccountChangeTransaction

export const isAccountChangeTransaction = (ac: AccountChange): ac is AccountChangeTransaction => (
    ac.data.type === 'transaction'
)