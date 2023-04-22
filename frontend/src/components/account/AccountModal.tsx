import { Button, Skeleton } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { OpenContextModal } from "@mantine/modals/lib/context";
import { useState } from "react";
import { useAddAccount } from "../../hooks/api/useMutation";
import { useCurrencies } from "../../hooks/api/useQuery";
import { AccountForm, AccountFormValues, TransformedAccountFormValues, accountFormTransform, accountFormValidate } from "./AccountForm";

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

type Transform = (values: AccountFormValues) => TransformedAccountFormValues

export const AccountModal = ({ context, id }: ContextModalProps<{}>) => {
    const currencies = useCurrencies();

    const form = useForm<AccountFormValues, Transform>({
        validate: accountFormValidate,
        transformValues: (values: AccountFormValues) => accountFormTransform(values, currencies),
    })

    const [loading, setLoading] = useState(false);
    const addAccount = useAddAccount();

    const handleSubmit = (values: TransformedAccountFormValues) => {
        setLoading(true);
        addAccount.mutate(values, {
            onSuccess: () => context.closeModal(id),
            onSettled: () => setLoading(false)
        });
    }

    if (!currencies.isSuccess)
        return <Skeleton height={300}></Skeleton>
    return <form onSubmit={form.onSubmit(handleSubmit)}>
        <AccountForm form={form} currencies={currencies.data} modal={true}/>
        <Button mt='lg' fullWidth type="submit"
            loading={loading}>
            create
        </Button>
    </form>
}
