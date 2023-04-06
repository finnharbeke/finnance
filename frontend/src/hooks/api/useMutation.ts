import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CurrencyFormValues } from "../../components/Currency";
import { TransformedAccountFormValues } from "../../components/modals/AccountModal";
import { transformedFormValues } from "../../components/modals/TransactionModal";
import { OrderFormValues } from "../../components/account/AccountFormList";

export const useAddTransaction = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: transformedFormValues) =>
            axios.post('/api/transactions/add', values),
        onSuccess: () => queryClient.invalidateQueries(["changes"])
    });
}

export const useAddCurrency = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: CurrencyFormValues) =>
            axios.post('/api/currencies/add', values),
        onSuccess: () => queryClient.invalidateQueries(["currencies"])
    });
}

export const useAddAccount = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: TransformedAccountFormValues) =>
            axios.post(`/api/accounts/add`, values),
        onSuccess: () => queryClient.invalidateQueries(["accounts"])
    });
}

export const useEditAccount = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, values }: { id: number, values: TransformedAccountFormValues }) =>
            axios.put(`/api/accounts/edit/${id}`, values),
        onSuccess: () => queryClient.invalidateQueries(["accounts"])
    });
}

export const useEditAccountOrders = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: OrderFormValues) =>
            axios.put(`/api/accounts/orders`, values),
        onSuccess: () => queryClient.invalidateQueries(["accounts"])
    });
}