import { AxiosError } from "axios"
import { AgentQueryResult } from "./Agent"
import { RecordFormValues } from "./Record"
import { TransactionQueryResult } from "./Transaction"
import { getAxiosData, searchParams } from "../query"
import { useQuery } from "@tanstack/react-query"
import { FilterRequest } from "../components/Filter"

export interface FlowQueryResult {
    id: number
    trans_id: number
    amount: number
    agent_id: number
    agent_desc: string
    is_debt: boolean
    type: 'flow'
}

export interface FlowDeepQueryResult extends FlowQueryResult {
    trans: TransactionQueryResult
    agent: AgentQueryResult
}

export interface FlowFormValues {
    amount: number | ''
    agent: string
    ix: number
    type: 'flow'
}

export interface FlowRequest {
    amount: number
    agent: string
}

export const isFlow = (val: FlowFormValues | RecordFormValues):
    val is FlowFormValues => val.type === 'flow';

export const emptyFlowFormValues = (ix: number): FlowFormValues => ({
    amount: '',
    agent: '',
    type: 'flow',
    ix
})

export const flowsFormValues:
    (fs: FlowQueryResult[], offset: number) => (FlowFormValues | RecordFormValues)[]
    = (fs, offset) => fs.map((fl, i) => ({
        amount: fl.amount,
        agent: fl.agent_desc,
        type: 'flow',
        ix: offset + i
    }))

interface useFlowsReturn {
    flows: FlowDeepQueryResult[]
    pages: number
}

export const useFlows = (props: FilterRequest) =>
    useQuery<useFlowsReturn, AxiosError>({
        queryKey: ['flows', props],
        queryFn: () => getAxiosData(`/api/flows?${searchParams(props)}`)
    });