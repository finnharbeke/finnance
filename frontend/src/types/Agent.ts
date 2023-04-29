import { useQuery } from "@tanstack/react-query"
import { FlowQueryResult } from "./Flow"
import { TransactionQueryResult } from "./Transaction"
import { UserQueryResult } from "./User"
import { AxiosError } from "axios"

export interface AgentQueryResult {
    desc: string,
    id: number,
    user_id: number,
    type: 'agent'
}

export interface AgentDeepQueryResult extends AgentQueryResult {
    user: UserQueryResult
    transactions: TransactionQueryResult[]
    flows: FlowQueryResult[]
}

export const useAgents = () =>
    useQuery<AgentQueryResult[], AxiosError>({ queryKey: ["agents"] });

export const useAgent = (agent_id: number) =>
    useQuery<AgentDeepQueryResult, AxiosError>({ queryKey: ["agents", agent_id] });
