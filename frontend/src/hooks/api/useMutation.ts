import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CurrencyFormValues } from "../../components/Currency";
import { TransformedAccountFormValues } from "../../components/account/AccountForm";
import { transformedFormValues } from "../../components/modals/TransactionModal";
import { OrderFormValues } from "../../components/account/AccountList";
import { AddCategoryFormValues, TransformedCategoryFormValues } from "../../components/category/Categories";
import { TransferFormValues } from "../../components/transfer/TransferModal";

export const useAddTransaction = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: transformedFormValues) =>
            axios.post('/api/transactions/add', values),
        onSuccess: () => queryClient.invalidateQueries(["changes"])
    });
}

export const useAddTransfer = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: TransferFormValues) =>
            axios.post('/api/transfers/add', values),
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
            axios.put(`/api/accounts/${id}/edit`, values),
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

export const useAddCategory = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: AddCategoryFormValues) =>
            axios.post(`/api/categories/add`, values),
        onSuccess: () => queryClient.invalidateQueries(["categories"])
    });
}

export const useEditCategory = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, values }: { id: number, values: TransformedCategoryFormValues }) =>
        axios.put(`/api/categories/${id}/edit`, values),
        onSuccess: () => queryClient.invalidateQueries(["categories"])
    });
}

export const useEditCategoryOrders = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: OrderFormValues) =>
            axios.put(`/api/categories/orders`, values),
        onSuccess: () => queryClient.invalidateQueries(["categories"])
    });
}