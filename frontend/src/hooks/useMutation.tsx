import { showNotification } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
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

export const useAddTransaction = () =>
    useMutation({
        mutationFn: (values: transformedFormValues) =>
            fetch(`/api/transactions/add`, {
                method: 'post',
                body: JSON.stringify(values),
            }).then(handleSuccess)
    });

export const useAddCurrency = () =>
    useMutation({
        mutationFn: (values: CurrencyFormValues) =>
            fetch(`/api/currencies/add`, {
                method: 'post',
                body: JSON.stringify(values),
            }).then(handleSuccess)
    });

export const useEditAccount = () =>
    useMutation({
        mutationFn: ({ id, values }: { id: number, values: TransformedAccountFormValues }) =>
            fetch(`/api/accounts/edit/${id}`, {
                method: 'put',
                body: JSON.stringify(values),
            }).then(handleSuccess)
    });