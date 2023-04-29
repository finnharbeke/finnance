import { Button, Skeleton } from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { OpenContextModal } from "@mantine/modals/lib/context";
import { useState } from "react";
import { useCurrencies } from "../../hooks/api/useQuery";
import { AccountRequest, useAccountForm, useAddAccount } from "../../types/Account";
import { AccountForm } from "./AccountForm";

export const openAccountModal = async (props: OpenContextModal) => {
    openContextModal({
        ...{
            modal: 'account',
            title: 'new account',
            size: 'lg'
        },
        ...props,
    })
}

export const AccountModal = ({ context, id }: ContextModalProps<{}>) => {
    const currencies = useCurrencies();

    const form = useAccountForm({
        desc: '',
        starting_saldo: '',
        date_created: new Date(),
        color: '',
        currency_id: ''
    })

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
