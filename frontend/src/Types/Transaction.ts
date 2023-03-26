import { AccountFlat } from "./Account"
import { AgentFlat } from "./Agent"
import { CurrencyFlat } from "./Currency"
import { FlowFlat } from "./Flow"
import { RecordFlat } from "./Record"

export interface TransactionFlat {
    id: number,
    currency_id: number,
    agent_id: number,
    comment: string,
    amount: number,
    is_expense: boolean,
    account_id: number,
    date_issued: string,
    user_id: number,
    type: 'transaction',
}

export interface TransactionDeep extends TransactionFlat {
    agent: AgentFlat,
    account: AccountFlat,
    currency: CurrencyFlat,
    records: RecordFlat[]
    flows: FlowFlat[]
}