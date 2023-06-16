import { useForm } from "@mantine/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useEffect } from "react";
import { AgentQueryResult } from "./Agent";
import { isFlow } from "./Flow";
import { isRecord } from "./Record";
import { TransactionFormValues, useTransactionFormValues } from "./Transaction";

interface TemplateQueryResult {
    id: number,
    user_id: number,
    desc: string,
    order: number,

    account_id: number | null,
    currency_id: number | null,
    amount: number | null,
    is_expense: boolean,
    agent_id: number | null,
    comment: string | null,
    direct: boolean,
    remote_agent_id: number | null,

    type: 'template',
}

interface FlowTemplateQueryResult {
    id: number
    user_id: number
    template_id: number
    amount: number | null
    agent_id: number | null
    agent_desc: string | null
    ix: number
    type: 'flowtemplate'
}

interface RecordTemplateQueryResult {
    id: number
    user_id: number
    template_id: number
    amount: number | null
    category_id: number | null
    ix: number
    type: 'recordtemplate'
}

export interface TemplateDeepQueryResult extends TemplateQueryResult {
    agent: AgentQueryResult | null
    remote_agent: AgentQueryResult | null
    flows: FlowTemplateQueryResult[]
    records: RecordTemplateQueryResult[]
}

interface FlowTemplateRequest {
    amount?: number
    agent?: string
    ix: number
}

interface RecordTemplateRequest {
    amount?: number
    category_id?: number
    ix: number
}

export interface TemplateRequest {
    desc: string
    is_expense: boolean
    direct: boolean

    comment: string
    flows: FlowTemplateRequest[]
    records: RecordTemplateRequest[]

    account_id?: number
    currency_id?: number
    amount?: number
    agent?: string
    remote_agent?: string
}

export interface TemplateFormValues extends TransactionFormValues {
    desc: string
}

export type TemplateTransform = (fv: TemplateFormValues) => TemplateRequest

export const useTemplateForm = () => {
    const initial = useTransactionFormValues({});

    const form = useForm<TemplateFormValues, TemplateTransform>({
        initialValues: {
            ...initial,
            desc: ''
        },
        validate: {
            desc: v => v.length > 0 ? null : 'enter description'
        },
        transformValues: (fv) => ({
            desc: fv.desc,
            is_expense: fv.is_expense,
            direct: fv.direct,
            comment: fv.comment,
            flows: fv.items.filter(isFlow).map(item => ({
                    ...(item.amount !== '') && { amount: item.amount },
                    ...(item.agent !== '') && { agent: item.agent },
                    ix: item.ix
                })),
            records: fv.direct ?
                [] : fv.items.filter(isRecord)
                    .map(item => ({
                        ...(item.amount !== '') && { amount: item.amount },
                        ...(item.category_id !== null) && { category_id: parseInt(item.category_id) },
                        ix: item.ix
                    })),
            ...(fv.account_id !== null && fv.account_id !== 'remote') && { account_id: parseInt(fv.account_id) },
            ...(fv.currency_id !== null) && { currency_id: parseInt(fv.currency_id) },
            ...(fv.amount !== '') && { amount: fv.amount },
            ...(fv.agent !== '') && { agent: fv.agent },
            ...(fv.remote_agent !== '') && { remote_agent: fv.remote_agent },
        })
    })

    // COPY PASTA FROM TRANSACTION !!
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

export const useTemplates = () =>
    useQuery<TemplateDeepQueryResult[], AxiosError>({ queryKey: ['templates'] });

export const useAddTemplate = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: TemplateRequest) =>
            axios.post('/api/templates/add', values),
        onSuccess: () => {
            queryClient.invalidateQueries(['templates']);
        }
    });
}

export const useDeleteTemplate = (id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () =>
            axios.delete(`/api/templates/${id}/delete`),
        onSuccess: () => {
            queryClient.invalidateQueries(['templates']);
        }
    });
}