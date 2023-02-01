import { AccountFlat } from "./Account"

export interface UserFlat {
    id: number,
    username: string,
    email: string
}

export interface UserDeep extends UserFlat {
    accounts: AccountFlat[]
}