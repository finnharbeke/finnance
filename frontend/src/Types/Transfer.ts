import { AccountFlat } from "./Account"

export interface TransferFlat {
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

export interface TransferDeep extends TransferFlat {
    src: AccountFlat,
    dst: AccountFlat
}