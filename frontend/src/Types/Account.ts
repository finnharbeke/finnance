import { CurrencyQueryResult } from "./Currency"
import { TransactionQueryResult } from "./Transaction";
import { TransferQueryResult } from "./Transfer";
import { UserQueryResult } from "./User"

export interface AccountQueryResult {
    id: number,
    date_created: string,
    user_id: number,
    order: number,
    desc: string,
    starting_saldo: number,
    currency_id: number,
    color: string,
    saldo: number,
    type: 'account'
}

export interface AccountDeepQueryResult extends AccountQueryResult {
    currency: CurrencyQueryResult,
    user: UserQueryResult,
}

export interface ChangeBase {
    type: 'change',
    acc_id: number,
    saldo: number,
    target: string
}
export interface ChangeTransfer extends ChangeBase {
    data: TransferQueryResult,
}

export interface ChangeTransaction extends ChangeBase {
    data: TransactionQueryResult,
}

export type Change = ChangeTransfer | ChangeTransaction;

export const isChangeTransaction = (ac: Change): ac is ChangeTransaction => (
    ac.data.type === 'transaction'
)