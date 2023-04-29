import { UseFormReturnType, useForm } from "@mantine/form"
import { DateTime, Duration } from "luxon"
import { AccountQueryResult } from "./Account"
import { AgentQueryResult } from "./Agent"
import { CurrencyQueryResult } from "./Currency"
import { FlowFormValues, FlowQueryResult, FlowRequest, flowsFormValues, isFlow } from "./Flow"
import { RecordFormValues, RecordQueryResult, RecordRequest, isRecord, recordsFormValues } from "./Record"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"

export interface TransactionQueryResult {
    id: number,
    currency_id: number,
    agent_id: number,
    comment: string,
    amount: number,
    is_expense: boolean,
    account_id: number | null,
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

export interface TransactionFormValues {
    account_id: string | null
    currency_id: string | null
    date: Date
    time: string
    amount: number | ''
    is_expense: boolean
    agent: string
    direct: boolean
    n_flows: number
    n_records: number
    items: (FlowFormValues | RecordFormValues)[]
    comment: string
}

export interface TransactionRequest {
    account_id: number | undefined
    currency_id: number | undefined
    date_issued: string
    amount: number
    agent: string
    is_expense: boolean
    flows: FlowRequest[]
    records: RecordRequest[]
    comment: string
}

export type TransactionTransform = (v: TransactionFormValues) => TransactionRequest
export type TransactionFormType = UseFormReturnType<TransactionFormValues, TransactionTransform>

export const datetimeString = (date: Date, timeS: string): string => {
    const time = DateTime.fromFormat(timeS, "HH:mm")
    return DateTime.fromJSDate(date).startOf('day').plus(Duration.fromObject({
        hour: time.hour,
        minute: time.minute
    })).toISO({ includeOffset: false })
}

export const useTransactionForm = (initial: TransactionFormValues) =>
    useForm<TransactionFormValues, TransactionTransform>({
        initialValues: initial,
        validate: {
            currency_id: (val, fv) => val === null && fv.account_id === null ? 'choose currency' : null,
            time: val => val === '' ? 'enter time' : null,
            amount: val => val === '' ? 'enter amount' : null,
            agent: desc => desc.length === 0 ? "at least one character" : null,
            direct: (val, fv) => !val && fv.items.length === 0 ? 'at least one record or flow' : null,
            items: {
                agent: (desc, fv, path) => {
                    const i = parseInt(path.replace(/^\D+/g, ''));
                    if (fv.direct || isRecord(fv.items[i]))
                        return null;
                    if (desc.length === 0)
                        return 'at least one character';
                    for (let j = 0; j < i; j++) {
                        const item = fv.items[j];
                        if (isFlow(item) && item.agent === desc)
                            return 'duplicate agent';
                    }
                    return null;
                },
                category_id: (id, fv, path) => {
                    const i = parseInt(path.replace(/^\D+/g, ''));
                    if (fv.direct || isFlow(fv.items[i]))
                        return null;
                    if (id === null)
                        return 'select category';
                    for (let j = 0; j < i; j++) {
                        const item = fv.items[j];
                        if (isRecord(item) && item.category_id === id)
                            return 'duplicate category';
                    }
                    return null;
                },
                amount: (value, fv, path) => {
                    if (fv.direct)
                        return null;
                    if (value === '')
                        return 'enter amount';
                    if (value === 0)
                        return 'non-zero amount';
                    const i = parseInt(path.replace(/^\D+/g, ''));
                    const sum = fv.items.slice(0, i + 1).reduce(
                        (sum, item) => sum + (item.amount === '' ? 0 : item.amount), 0
                    );
                    if (fv.amount !== '' && sum > fv.amount)
                        return 'exceeds total';
                    if (i === fv.items.length - 1 && fv.amount !== '' && sum < fv.amount)
                        return 'less than total';
                    return null;
                }
            }
        },
        transformValues: (fv: TransactionFormValues) => ({
            account_id: fv.account_id === null ? undefined : parseInt(fv.account_id),
            currency_id: fv.currency_id === null ? undefined : parseInt(fv.currency_id),
            is_expense: fv.is_expense,
            agent: fv.agent,
            amount: fv.amount ? fv.amount : 0,
            comment: fv.comment,
            date_issued: datetimeString(fv.date, fv.time),
            flows: fv.direct ?
                [{ amount: fv.amount ? fv.amount : 0, agent: fv.agent }]
                :
                fv.items.filter(isFlow).map(item => ({
                    amount: item.amount ? item.amount : 0,
                    agent: item.agent
                })),
            records: fv.direct ?
                [] : fv.items.filter(isRecord)
                    .map(item => ({
                        amount: item.amount ? item.amount : 0,
                        category_id:
                            item.category_id === null ? -1 : parseInt(item.category_id)
                    })),
        })
    })

export const useTransactionFormValues:
    (t?: TransactionDeepQueryResult, a?: AccountQueryResult)
        => TransactionFormValues
    = (trans, acc) =>
        trans ? {
            account_id: trans.account_id === null ?
                null : trans.account_id.toString(),
            currency_id: trans.account_id === null ?
                trans.currency_id.toString() : null,
            date: DateTime.fromISO(trans.date_issued).startOf('day').toJSDate(),
            time: DateTime.fromISO(trans.date_issued).toFormat('HH:mm'),
            amount: trans.amount,
            is_expense: trans.is_expense,
            agent: trans.agent.desc,
            direct: trans.flows.length === 1 && trans.flows[0].agent_id === trans.agent_id,
            n_flows: trans.flows.length,
            n_records: trans.records.length,
            items: recordsFormValues(trans.records, 0)
                .concat(
                    flowsFormValues(trans.flows, trans.records.length)
                ),
            comment: trans.comment
        } : {
            account_id: acc ? acc.id.toString() : null,
            currency_id: null,
            date: new Date(),
            time: DateTime.now().toFormat('HH:mm'),
            amount: '',
            is_expense: true,
            agent: '',
            direct: false,
            n_flows: 0,
            n_records: 0,
            items: [],
            comment: '',
        }


export const useTransaction = (trans_id: number) =>
    useQuery<TransactionDeepQueryResult, AxiosError>({ queryKey: ['transactions', trans_id] });

export const useAddTransaction = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: TransactionRequest) =>
            axios.post('/api/transactions/add', values),
        onSuccess: () => {
            queryClient.invalidateQueries(['changes'])
            queryClient.invalidateQueries(['transactions'])
        }
    });
}

export const useEditTransaction = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, values }: { id: number, values: TransactionRequest }) =>
            axios.post(`/api/transactions/${id}/edit`, values),
        onSuccess: () => {
            queryClient.invalidateQueries(['changes']);
            queryClient.invalidateQueries(['transactions']);
        }
    });
}