import { Button, ColorInput, Grid, Select, Skeleton, TextInput } from "@mantine/core";
import { DateInput, DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { OpenContextModal } from "@mantine/modals/lib/context";
import { DateTime } from "luxon";
import { useCurrencies } from "../../hooks/api/useQuery";
import AmountInput from "../Inputs/AmountInput";
import useIsPhone from "../../hooks/useIsPhone";
import { useAddAccount } from "../../hooks/api/useMutation";
import { useState } from "react";
import findId from "../../helpers/findId";
import { amountToInteger } from "../../helpers/convert";

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

export interface AccountFormValues {
    desc: string
    starting_saldo: number
    date_created: Date
    color: string
    currency_id: string
}

export interface TransformedAccountFormValues {
    desc: string
    starting_saldo: number
    date_created: string
    color: string
    currency_id: number
}

type Transform = (values: AccountFormValues) => TransformedAccountFormValues

export const AccountModal = ({ context, id }: ContextModalProps<{}>) => {
    const isPhone = useIsPhone();
    const currencies = useCurrencies();

    const form = useForm<AccountFormValues, Transform>({
        validate: {
            desc: (val) => (val && val.length > 0) ? null : "enter account name",
            starting_saldo: (val) => val !== undefined ? null : "enter starting saldo",
            date_created: (val) => val ? null : "enter starting date",
            color: (val) => (val && val.length === 7) ? null : "enter hex color",
            currency_id: (val) => (val && val.length > 0) ? null : "enter hex color",
        },
        transformValues: (values: AccountFormValues) => {
            if (!currencies.isSuccess)
                throw new Error('currencies not fetched');
            const c_id = parseInt(values.currency_id);
            const currency = findId(currencies.data, c_id);
            if (!currency)
                throw new Error('invalid currency_id');
            return ({
                ...values,
                currency_id: c_id,
                starting_saldo: amountToInteger(values.starting_saldo, currency),
                date_created: DateTime.fromJSDate(values.date_created).toISO({ includeOffset: false }),
            })
        },
    })

    const [loading, setLoading] = useState(false);
    const addAccount = useAddAccount();

    const handleSubmit = (values: TransformedAccountFormValues) => {
        setLoading(true);
        addAccount.mutate(values,
            { onSuccess: () => context.closeModal(id) }
        );
    }

    if (!currencies.isSuccess)
        return <Skeleton height={300}></Skeleton>
    return <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
            <Grid.Col span={12}>
                <TextInput label="account name" withAsterisk

                    {...form.getInputProps('desc')}
                />
            </Grid.Col>
            <Grid.Col sm={6} xs={12}>
                {
                    isPhone ?
                        <DatePickerInput
                            popoverProps={{ withinPortal: true }}
                            label="tracking since"
                            withAsterisk

                            {...form.getInputProps('date_created')}
                        />
                        :
                        <DateInput
                            popoverProps={{ withinPortal: true }}
                            label="tracking since"
                            withAsterisk

                            {...form.getInputProps('date_created')}
                        />

                }
            </Grid.Col>
            <Grid.Col sm={6} xs={12}>
                <ColorInput
                    disallowInput={isPhone}
                    label="color" withAsterisk

                    {...form.getInputProps('color')}
                />
            </Grid.Col>
            <Grid.Col sm={6} xs={12}>
                <Select label="currency" withAsterisk
                    searchable={!isPhone}
                    placeholder="select currency"
                    data={currencies.isLoading ? [] : currencies.data.map(
                        cur => ({
                            value: cur.id.toString(),
                            label: cur.code,
                        })
                    )}
                    {...form.getInputProps('currency_id')}
                />
            </Grid.Col>
            <Grid.Col sm={6} xs={12}>
                <AmountInput withAsterisk

                    label={form.values.date_created ?
                        `saldo at ${DateTime.fromJSDate(form.values.date_created).toFormat("dd.LL.yy")}`
                        : 'saldo at start'}
                    currency={
                        currencies.data.filter(cur => cur.id.toString() === form.values.currency_id)[0]
                    }
                    {...form.getInputProps('starting_saldo')}
                />
            </Grid.Col>
        </Grid>
        <Button mt='lg' fullWidth type="submit"
            loading={loading}>
            create
        </Button>
    </form>
}