import { AccountQueryResult } from "./Account"
import { AgentQueryResult } from "./Agent"
import { CurrencyQueryResult } from "./Currency"
import { FlowQueryResult } from "./Flow"
import { RecordQueryResult } from "./Record"

export interface TransactionQueryResult {
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

export interface TransactionDeepQueryResult extends TransactionQueryResult {
    agent: AgentQueryResult,
    account: AccountQueryResult,
    currency: CurrencyQueryResult,
    records: RecordQueryResult[]
    flows: FlowQueryResult[]
}