import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CurrencyFormValues } from "../../components/Currency";
import { TransformedAccountFormValues } from "../../components/account/AccountForm";
import { transformedFormValues } from "../../components/modals/Transaction";

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

export const useEditAccount = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, values }: { id: number, values: TransformedAccountFormValues }) =>
            axios.put(`/api/accounts/edit/${id}`, values),
        onSuccess: () => queryClient.invalidateQueries(["accounts"])
    });
}