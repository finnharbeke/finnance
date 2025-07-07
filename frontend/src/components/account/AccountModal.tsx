import { Button, Skeleton } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useState } from "react";
import { AccountRequest, useAccountForm, useAccountFormValues, useAddAccount } from "../../types/Account";
import { useCurrencies } from "../../types/Currency";
import { AccountForm } from "./AccountForm";

export const AccountModal = ({ context, id }: ContextModalProps<{}>) => {
    const currencies = useCurrencies();

    const initial = useAccountFormValues();
    const form = useAccountForm(initial);

    const [loading, setLoading] = useState(false);
    const addAccount = useAddAccount();

    const handleSubmit = (values: AccountRequest) => {
        setLoading(true);
        addAccount.mutate(values, {
            onSuccess: () => context.closeModal(id),
            onSettled: () => setLoading(false)
        });
    }

    if (!currencies.isSuccess)
        return <Skeleton height={300}></Skeleton>
    return <form onSubmit={form.onSubmit(handleSubmit)}>
        <AccountForm form={form} currencies={currencies.data} modal={true} />
        <Button mt='lg' fullWidth type="submit"
            loading={loading}>
            create
        </Button>
    </form>
}
