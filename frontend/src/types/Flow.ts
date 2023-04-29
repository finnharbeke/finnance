import { RecordFormValues } from "./Record"

export interface FlowQueryResult {
    id: number
    trans_id: number
    amount: number
    agent_id: number
    agent_desc: string
    type: 'flow'
}

export interface FlowFormValues {
    amount: number | ''
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
    (fs: FlowQueryResult[], offset: number) => (FlowFormValues | RecordFormValues)[]
    = (fs, offset) => fs.map((fl, i) => ({
        amount: fl.amount,
        agent: fl.agent_desc,
        type: 'flow',
        ix: offset + i
    }))