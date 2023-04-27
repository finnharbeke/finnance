import { AccountQueryResult } from "./Account"

export interface UserQueryResult {
    id: number,
    username: string,
    email: string
    type: 'user'
}

export interface UserDeepQueryResult extends UserQueryResult {
    accounts: AccountQueryResult[]
}