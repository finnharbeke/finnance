import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CurrencyFormValues } from "../../components/Currency";
import { OrderFormValues } from "../../components/account/AccountList";

export const useAddCurrency = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: CurrencyFormValues) =>
            axios.post('/api/currencies/add', values),
        onSuccess: () => queryClient.invalidateQueries(["currencies"])
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

export const useEditCategoryOrders = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: OrderFormValues) =>
            axios.put(`/api/categories/orders`, values),
        onSuccess: () => queryClient.invalidateQueries(["categories"])
    });
}