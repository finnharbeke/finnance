import { UseFormReturnType, useForm } from "@mantine/form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { DateTime, Duration } from "luxon"
import { useEffect, useState } from "react"
import { FilterRequest } from "../components/Filter"
import { getAxiosData, searchParams } from "../query"
import { AccountQueryResult } from "./Account"
import { AgentQueryResult } from "./Agent"
import { CurrencyQueryResult } from "./Currency"
import { FlowFormValues, FlowQueryResult, FlowRequest, flowsFormValues, isFlow } from "./Flow"
import { RecordFormValues, RecordQueryResult, RecordRequest, emptyRecordFormValues, isRecord, recordsFormValues } from "./Record"
import { TemplateDeepQueryResult } from "./Template"

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
    comment: string

    direct: boolean
    remote_agent: string | undefined
    n_flows: number
    n_records: number
    last_update: number
    items: (FlowFormValues | RecordFormValues)[]
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
    remote_agent: string | undefined
    direct: boolean
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

export const useTransactionForm = (initial: TransactionFormValues) => {
    const form = useForm<TransactionFormValues, TransactionTransform>({
        initialValues: initial,
        validate: {
            account_id: (val, fv) => val === null ? 'choose account' : null,
            currency_id: (val, fv) => val === null ? 'choose currency' : null,
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
            account_id: fv.account_id === null ? -1 :
                fv.account_id === 'remote' ? undefined : parseInt(fv.account_id),
            currency_id: fv.currency_id === null ? undefined : parseInt(fv.currency_id),
            is_expense: fv.is_expense,
            agent: fv.agent,
            amount: fv.amount ? fv.amount : 0,
            comment: fv.comment,
            date_issued: datetimeString(fv.date, fv.time),
            flows: fv.direct || fv.remote_agent ?
                []
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
            remote_agent: fv.remote_agent,
            direct: fv.direct
        })
    });

    // auto-adjust item amounts
    // lil bit sketchy tbh
    useEffect(() => form.setFieldValue('last_update', -1),
        // eslint-disable-next-line
        [form.values.amount, form.values.n_flows, form.values.n_records])

    const sum = form.values.items.reduce(
        (sum, item) => sum + (item.amount === '' ? 0 : item.amount), 0
    );
    useEffect(() => {
        // without the 20ms the form's not ready
        new Promise(r => setTimeout(r, 20)).then(() => {
            const total = form.values.amount;
            if (total === '' || form.values.items.length === 0) {
                form.setFieldValue('last_update', -1);
                return;
            }
            let toCorrect = (total - sum);
            form.values.items.forEach((item, i) => {
                if (toCorrect === 0 || i === form.values.last_update)
                    return;
                const correct = Math.max(-item.amount, toCorrect);
                form.setFieldValue(`items.${i}.amount`, (item.amount === '' ? 0 : item.amount) + correct);
                toCorrect -= correct;
            })
            form.setFieldValue('last_update', -1);
        })
        // eslint-disable-next-line
    }, [form.values.amount, sum, form.values.n_flows, form.values.n_records])

    return form;
}

export interface UseTransactionFormValuesProps {
    trans?: TransactionDeepQueryResult
    account?: AccountQueryResult
    remote?: boolean
    template?: TemplateDeepQueryResult
}

export const useTransactionFormValues = (
    { trans, account: acc, remote = false, template: temp }: UseTransactionFormValuesProps
): TransactionFormValues => {
    const build: () => TransactionFormValues = () => {
        if (trans !== undefined) {
            const direct = trans.flows.length === 1 && trans.flows[0].agent_id === trans.agent_id;
            return {
                account_id: trans.account_id === null ?
                    'remote' : trans.account_id.toString(),
                currency_id: trans.currency_id.toString(),
                date: DateTime.fromISO(trans.date_issued).startOf('day').toJSDate(),
                time: DateTime.fromISO(trans.date_issued).toFormat('HH:mm'),
                amount: trans.amount,
                is_expense: trans.is_expense,
                agent: trans.agent.desc,
                direct: direct,
                n_flows: trans.flows.length,
                n_records: trans.records.length,
                items: recordsFormValues(trans.records, 0)
                    .concat(
                        trans.account_id === null || direct ?
                            [] : flowsFormValues(trans.flows, trans.records.length)
                    ),
                comment: trans.comment,
                last_update: -1,
                remote_agent: trans.account_id === null ?
                    trans.flows[0].agent_desc : undefined,
            }
        } else if (temp !== undefined)
            return {
                account_id: temp.remote_agent !== null ?
                    'remote' : temp.account_id === null ?
                    null : temp.account_id.toString(),
                currency_id: temp.currency_id === null ?
                    null : temp.currency_id.toString(),
                date: new Date(),
                time: DateTime.now().toFormat('HH:mm'),
                amount: temp.amount === null ? '' : temp.amount,
                is_expense: temp.is_expense,
                agent: temp.agent === null ? '' : temp.agent.desc,
                direct: temp.direct,
                n_flows: temp.flows.length,
                n_records: temp.records.length,
                items: temp.records.map<RecordFormValues | FlowFormValues>(r => ({
                    amount: r.amount === null ? '' : r.amount,
                    category_id: r.category_id === null ? null : r.category_id.toString(),
                    ix: r.ix,
                    type: 'record'
                })).concat(temp.flows.map<FlowFormValues>(f => ({
                    amount: f.amount === null ? '' : f.amount,
                    agent: f.agent_desc === null ? '' : f.agent_desc,
                    ix: f.ix,
                    type: 'flow'
                }))),
                comment: temp.comment === null ? '' : temp.comment,
                last_update: -1,
                remote_agent: temp.remote_agent === null ? undefined : temp.remote_agent.desc,
            }
        else return {
            account_id: remote ? 'remote' : acc ? acc.id.toString() : null,
            currency_id: acc ? acc.currency_id.toString() : null,
            date: new Date(),
            time: DateTime.now().toFormat('HH:mm'),
            amount: '',
            is_expense: true,
            agent: '',
            direct: false,
            n_flows: 0,
            n_records: 1,
            items: [emptyRecordFormValues(0)],
            comment: '',
            last_update: -1,
            remote_agent: acc ? undefined : ''
        }
    }
    const [fv, setFV] = useState(build());
    // eslint-disable-next-line
    useEffect(() => setFV(build()), [trans, acc]);
    return fv;
}

export const useTransaction = (trans_id: number) =>
    useQuery<TransactionDeepQueryResult, AxiosError>({ queryKey: ['transactions', trans_id] });

export interface useTransactionsProps extends FilterRequest {
    account_id?: string | null
}

interface useTransactionsReturn {
    transactions: TransactionDeepQueryResult[]
    pages: number
}

export const useTransactions = (props: useTransactionsProps) => {
    const queryClient = useQueryClient();
    // prefetch 2 pages left and right
    const page = props.page;
    for (let off of [-2, -1, 1, 2]) {
        let other_page = page + off;
        let new_props = { ...props, page: other_page };
        queryClient.prefetchQuery<useTransactionsReturn, AxiosError>({
            queryKey: ['transactions', new_props],
            queryFn: () => getAxiosData(`/api/transactions?${searchParams(new_props)}`)
        })
    }
    return useQuery<useTransactionsReturn, AxiosError>({
        queryKey: ['transactions', props],
        queryFn: () => getAxiosData(`/api/transactions?${searchParams(props)}`)
    });
}

export const useAddTransaction = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: TransactionRequest) =>
            axios.post('/api/transactions/add', values),
        onSuccess: () => {
            // instead of so many individual ones, invalidate all
            queryClient.invalidateQueries();
        }
    });
}

export const useEditTransaction = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, values }: { id: number, values: TransactionRequest }) =>
            axios.put(`/api/transactions/${id}/edit`, values),
        onSuccess: () => {
            // instead of so many individual ones, invalidate all
            queryClient.invalidateQueries();
        }
    });
}

export const useDeleteTransaction = (id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () =>
            axios.delete(`/api/transactions/${id}/delete`),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['transactions', id] })
            // instead of so many individual ones, invalidate all
            queryClient.invalidateQueries();
        }
    });
}