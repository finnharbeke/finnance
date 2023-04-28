import { AccountQueryResult } from "./Account"

export interface TransferQueryResult {
    id: number,
    src_id: number,
    dst_id: number,
    src_amount: number,
    dst_amount: number,
    user_id: number,
    date_issued: string,
    comment: string,
    type: 'accounttransfer'
}

export interface TransferDeepQueryResult extends TransferQueryResult {
    src: AccountQueryResult,
    dst: AccountQueryResult
}