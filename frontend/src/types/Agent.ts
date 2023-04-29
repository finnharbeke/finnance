import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { FlowQueryResult } from "./Flow"
import { TransactionQueryResult } from "./Transaction"

export interface AgentQueryResult {
    desc: string,
    id: number,
    user_id: number,
    type: 'agent'
}

export interface AgentDeepQueryResult extends AgentQueryResult {
    transactions: TransactionQueryResult[]
    flows: FlowQueryResult[]
}

export const useAgents = () =>
    useQuery<AgentQueryResult[], AxiosError>({ queryKey: ["agents"] });

export const useAgent = (agent_id: number) =>
    useQuery<AgentDeepQueryResult, AxiosError>({ queryKey: ["agents", agent_id] });
