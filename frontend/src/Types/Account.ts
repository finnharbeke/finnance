export interface AccountFlat {
    id: number,
    date_created: string,
    user_id: number,
    order: number,
    desc: string,
    starting_saldo: number,
    currency_id: number,
    color: string,
    saldo: number,
    type: "account"
}