import { useForm } from "@mantine/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { FilterRequest } from "../components/Filter";
import { OrderRequest } from "../hooks/useOrderForm";
import { getAxiosData, searchParams } from "../query";
import { randomColor } from "./Color";
import { CurrencyQueryResult } from "./Currency";
import { TransactionQueryResult } from "./Transaction";
import { TransferQueryResult } from "./Transfer";

export interface AccountQueryResult {
    id: number,
    date_created: string,
    user_id: number,
    order: number,
    desc: string,
    starting_saldo: number,
    currency_id: number,
    color: string,
    saldo: number,
    type: 'account'
}

export interface AccountDeepQueryResult extends AccountQueryResult {
    currency: CurrencyQueryResult,
}

export interface AccountFormValues {
    desc: string
    color: string
    date_created: Date
    starting_saldo: number | ''
    currency_id: string | null
}

export interface AccountRequest extends Omit<AccountFormValues,
    'starting_saldo' | 'currency_id' | 'date_created'> {
    starting_saldo: number
    date_created: string
    currency_id: number
}

export type AccountTransform = (v: AccountFormValues) => AccountRequest

export const useAccountForm = (initial: AccountFormValues) =>
    useForm<AccountFormValues, AccountTransform>({
        initialValues: initial,
        validate: {
            desc: val => (val && val.length > 0) ? null : "enter account name",
            color: val => (val && /^#([0-9A-Fa-f]{6})$/i.test(val)) ? null : "enter hex color",
            starting_saldo: val => val === '' ? 'enter starting saldo' : null,
            currency_id: val => val === null ? 'choose currency' : null
        },
        transformValues: (fv) => ({
            ...fv,
            starting_saldo: fv.starting_saldo === '' ? 0 : fv.starting_saldo,
            currency_id: fv.currency_id === null ? -1 : parseInt(fv.currency_id),
            date_created: DateTime.fromJSDate(fv.date_created).toISO({ includeOffset: false })
        })
    })

export const useAccountFormValues: (acc?: AccountQueryResult) => AccountFormValues
    = acc => {
        const build: () => AccountFormValues = () => acc ? {
            desc: acc.desc,
            starting_saldo: acc.starting_saldo,
            date_created: DateTime.fromISO(acc.date_created).toJSDate(),
            color: acc.color,
            currency_id: acc.currency_id.toString()
        } : {
            desc: '', color: randomColor(), date_created: new Date(),
            starting_saldo: '', currency_id: null
        }
        const [fv, setFV] = useState(build());
        // eslint-disable-next-line
        useEffect(() => setFV(build()), [acc]);
        return fv;
    }

export const useAccounts = () =>
    useQuery<AccountDeepQueryResult[], AxiosError>({ queryKey: ["accounts"] });

export const useAccount = (account_id: number) =>
    useQuery<AccountDeepQueryResult, AxiosError>({ queryKey: ["accounts", account_id] });

export const useAddAccount = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: AccountRequest) =>
            axios.post(`/api/accounts/add`, values),
        onSuccess: () => queryClient.invalidateQueries(["accounts"])
    });
}

export const useEditAccount = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, values }: { id: number, values: AccountRequest }) =>
            axios.put(`/api/accounts/${id}/edit`, values),
        onSuccess: () => queryClient.invalidateQueries(["accounts"])
    });
}

export const useAccountDependencies = (account_id: number) =>
    useQuery<number, AxiosError>({ queryKey: ["accounts", account_id, "dependencies"] });

export const useDeleteAccount = (id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () =>
            axios.delete(`/api/accounts/${id}/delete`),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['accounts', id] })
            queryClient.invalidateQueries();
        }
    });
}

export const useEditAccountOrders = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: OrderRequest) =>
            axios.put(`/api/accounts/orders`, values),
        onSuccess: () => queryClient.invalidateQueries(["accounts"])
    });
}

// || =======
// || CHANGES
// || =======

export interface ChangeBase {
    type: 'change',
    acc_id: number,
    saldo: number,
    target: string
}
export interface ChangeTransfer extends ChangeBase {
    data: TransferQueryResult,
}

export interface ChangeTransaction extends ChangeBase {
    data: TransactionQueryResult,
}

export type Change = ChangeTransfer | ChangeTransaction;

export const isChangeTransaction = (ac: Change): ac is ChangeTransaction => (
    ac.data.type === 'transaction'
)

interface useChangeReturn {
    changes: Change[]
    pages: number
}

export const useChanges = (id: number, props: FilterRequest) => {
    const queryClient = useQueryClient();
    // prefetch 2 pages left and right
    const page = props.page;
    for (let off of [-2, -1, 1, 2]) {
        let other_page = page + off;
        let new_props = { ...props, page: other_page };
        queryClient.prefetchQuery<useChangeReturn, AxiosError>({
            queryKey: ["changes", id, new_props],
            queryFn: () => getAxiosData(`/api/accounts/${id}/changes?${searchParams(new_props)}`)
        })
    }
    return useQuery<useChangeReturn, AxiosError>({
        queryKey: ["changes", id, props],
        queryFn: () => getAxiosData(`/api/accounts/${id}/changes?${searchParams(props)}`)
    });
}
