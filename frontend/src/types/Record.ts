import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { FilterRequest } from "../components/Filter"
import { getAxiosData, searchParams } from "../query"
import { FlowFormValues } from "./Flow"
import { CategoryQueryResult } from "./Category"
import { TransactionQueryResult } from "./Transaction"

export interface RecordQueryResult {
    id: number
    trans_id: number
    amount: number
    category_id: number
    type: 'record'
}

export interface RecordDeepQueryResult extends RecordQueryResult {
    trans: TransactionQueryResult
    category: CategoryQueryResult
}

export interface RecordFormValues {
    amount: number | ''
    category_id: string | null
    ix: number
    type: 'record'
}

export interface RecordRequest {
    amount: number
    category_id: number
}

export const isRecord = (val: FlowFormValues | RecordFormValues):
    val is RecordFormValues => val.type === 'record';

export const emptyRecordFormValues = (ix: number): RecordFormValues => ({
    amount: '',
    category_id: null,
    type: 'record',
    ix
})

export const recordsFormValues:
    (rs: RecordQueryResult[], offset: number) => (RecordFormValues | FlowFormValues)[]
    = (recs, offset) => recs.map((rec, i) => ({
        amount: rec.amount,
        category_id: rec.category_id.toString(),
        type: 'record',
        ix: offset + i
    }))

interface useRecordsReturn {
    records: RecordDeepQueryResult[]
    pages: number
}

export const useRecords = (props: FilterRequest) => {
    const queryClient = useQueryClient();
    // prefetch 2 pages left and right
    const page = props.page;
    for (let off of [-2, -1, 1, 2]) {
        let other_page = page + off;
        let new_props = { ...props, page: other_page };
        queryClient.prefetchQuery<useRecordsReturn, AxiosError>({
            queryKey: ['records', new_props],
            queryFn: () => getAxiosData(`/api/records?${searchParams(new_props)}`)
        })
    }
    return useQuery<useRecordsReturn, AxiosError>({
        queryKey: ['records', props],
        queryFn: () => getAxiosData(`/api/records?${searchParams(props)}`)
    });
}