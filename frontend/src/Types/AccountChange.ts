import { TransactionFlat } from "./Transaction"
import { TransferFlat } from "./Transfer"

export interface AccountChangeBase {
    type: 'AccountChange',
    acc_id: number,
    saldo: number,
    target: string
}
export interface AccountChangeTransfer extends AccountChangeBase {
    data: TransferFlat,
}

export interface AccountChangeTransaction extends AccountChangeBase {
    data: TransactionFlat,
}

export type AccountChange = AccountChangeTransfer | AccountChangeTransaction;

export const isAccountChangeTransaction = (ac: AccountChange): ac is AccountChangeTransaction => (
    ac.data.type === 'transaction'
)