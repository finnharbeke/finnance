import { UseFormReturnType, useForm } from "@mantine/form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { DateTime } from "luxon"
import { AccountQueryResult } from "./Account"
import { datetimeString } from "./Transaction"
import { useEffect, useState } from "react"

export interface TransferQueryResult {
    id: number,
    src_id: number,
    dst_id: number,
    src_amount: number,
    dst_amount: number,
    user_id: number,
    date_issued: string,
    comment: string,
    type: 'accounttransfer'
}

export interface TransferDeepQueryResult extends TransferQueryResult {
    src: TransferQueryResult,
    dst: AccountQueryResult
}

export interface TransferFormValues {
    src_id: string | null
    dst_id: string | null
    src_amount: number | ''
    dst_amount: number | ''
    date: Date
    time: string
    comment: string
    locked: boolean
}

export interface TransferRequest {
    src_id: number
    dst_id: number
    src_amount: number
    dst_amount: number
    date_issued: string | null
    comment: string
}

export type TransferTransform = (fv: TransferFormValues) => TransferRequest

export type TransferFormType = UseFormReturnType<TransferFormValues, TransferTransform>

export const useTransferForm = (initial: TransferFormValues) => {
    const form = useForm<TransferFormValues, TransferTransform>({
        initialValues: initial,
        validate: {
            src_id: val => val === null ? 'choose source account' : null,
            dst_id: val => val === null ? 'choose destination' : null,
            src_amount: val => val === '' ? 'enter source amount'
                : val === 0 ? 'non-zero amount' : null,
            dst_amount: val => val === '' ? 'enter destination amount'
                : val === 0 ? 'non-zero amount' : null,
            time: val => val === '' ? 'enter time' : null,
        },
        transformValues: fv => ({
            src_id: fv.src_id === null ? -1 : parseInt(fv.src_id),
            dst_id: fv.dst_id === null ? -1 : parseInt(fv.dst_id),
            src_amount: fv.src_amount === '' ? 0 : fv.src_amount,
            dst_amount: fv.dst_amount === '' ? 0 : fv.dst_amount,
            date_issued: datetimeString(fv.date, fv.time),
            comment: fv.comment
        })
    })

    useEffect(() => {
        if (form.values.locked)
            form.setFieldValue('dst_amount', form.values.src_amount)
        // eslint-disable-next-line
    }, [form.values.locked, form.values.src_amount])

    return form;
}

export const useTransferFormValues:
    (tf?: TransferQueryResult, src?: AccountQueryResult, dst?: AccountQueryResult)
        => TransferFormValues
    = (tf, src, dst) => {
        const build: () => TransferFormValues = () => tf ? {
            src_id: tf.src_id.toString(),
            dst_id: tf.dst_id.toString(),
            src_amount: tf.src_amount,
            dst_amount: tf.dst_amount,
            date: DateTime.fromISO(tf.date_issued).startOf('day').toJSDate(),
            time: DateTime.fromISO(tf.date_issued).toFormat('HH:mm'),
            comment: tf.comment,
            locked: tf.src_amount === tf.dst_amount
        } : {
            src_id: src ? src.id.toString() : null,
            dst_id: dst ? dst.id.toString() : null,
            src_amount: '',
            dst_amount: '',
            date: new Date(),
            time: DateTime.now().toFormat('HH:mm'),
            comment: '',
            locked: true
        }
        const [fv, setFV] = useState(build());
        // eslint-disable-next-line
        useEffect(() => setFV(build()), [tf, src, dst]);
        return fv;
    }

export const useTransfer = (transfer_id: number) =>
    useQuery<TransferDeepQueryResult, AxiosError>({ queryKey: ['transfers', transfer_id] });

export const useAddTransfer = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: TransferRequest) =>
            axios.post('/api/transfers/add', values),
        onSuccess: () => {
            queryClient.invalidateQueries(["changes"]);
            queryClient.invalidateQueries(["transfers"]);
            queryClient.invalidateQueries(['accounts']);
        }
    });
}

export const useEditTransfer = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, values }: { id: number, values: TransferRequest }) =>
            axios.put(`/api/transfers/${id}/edit`, values),
        onSuccess: () => {
            queryClient.invalidateQueries(['changes']);
            queryClient.invalidateQueries(['transfers']);
            queryClient.invalidateQueries(['accounts']);
        }
    });
}

export const useDeleteTransfer = (id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () =>
            axios.delete(`/api/transfers/${id}/delete`),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['transfers', id]});
            queryClient.invalidateQueries(['changes']);
            queryClient.invalidateQueries(['transfers']);
            queryClient.invalidateQueries(['accounts']);
        }
    });
}
