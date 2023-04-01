import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "react-query";
import { TransformedAccountFormValues } from "../components/account/AccountForm";
import { CurrencyFormValues } from "../components/Currency";
import { transformedFormValues } from "../components/modals/Transaction";

const handleSuccess = (r: Response) => r.json().then(data => {
    if (r.ok && data.success)
        return data
    else
        showNotification({
            title: `${r.status} ${r.statusText}`,
            message: data.msg,
            color: 'red',
            autoClose: false
        })
    throw new Response(data.msg, { status: r.status, statusText: r.statusText })
})

export const useAddTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation("key", (values: transformedFormValues) =>
    fetch(`/api/transactions/add`, {
        method: 'post',
        body: JSON.stringify(values),
    }).then(handleSuccess), {
        onSuccess: () => queryClient.invalidateQueries()
    });
}

export const useAddCurrency = () => {
    const queryClient = useQueryClient();
    return useMutation("key", (values: CurrencyFormValues) =>
    fetch(`/api/currencies/add`, {
        method: 'post',
        body: JSON.stringify(values),
    }).then(handleSuccess), {
        onSuccess: () => queryClient.invalidateQueries()
    });
}

export const useEditAccount = () => {
    const queryClient = useQueryClient();
    return useMutation("key", ({ id, values }: { id: number, values: TransformedAccountFormValues}) =>
    fetch(`/api/accounts/edit/${id}`, {
        method: 'put',
        body: JSON.stringify(values),
    }).then(handleSuccess), {
        onSuccess: () => queryClient.invalidateQueries("accounts"),
    });
}