import { Button, Center, Grid, Switch, TextInput } from "@mantine/core"
import { openContextModal } from "@mantine/modals"
import { ContextModalProps, OpenContextModal } from "@mantine/modals/lib/context"
import { useState } from "react"
import { TbArrowBigRightFilled, TbLock, TbLockOpen } from 'react-icons/tb'
import useIsPhone from "../../hooks/useIsPhone"
import { AccountDeepQueryResult, useAccounts } from "../../types/Account"
import { TransferFormType, TransferRequest, useAddTransfer, useTransferForm, useTransferFormValues } from "../../types/Transfer"
import Placeholder from "../Placeholder"
import AccountInput from "../input/AccountInput"
import AmountInput from "../input/AmountInput"
import DateTimeInput from "../input/DateTimeInput"

interface TransferFormProps {
    form: TransferFormType
    src_disabled: boolean
    dst_disabled: boolean
}

const TransferForm = ({ form, src_disabled, dst_disabled }: TransferFormProps) => {

    const query = useAccounts();
    const isPhone = useIsPhone();

    if (!query.isSuccess)
        return <Placeholder height={400} queries={[query]} />

    const accounts = query.data;

    const src_curr = accounts.reduce<AccountDeepQueryResult | undefined>(
        (prev, acc) => acc.id.toString() === form.values.src_id ?
            acc : prev, undefined
    )?.currency;
    const dst_curr = accounts.reduce<AccountDeepQueryResult | undefined>(
        (prev, acc) => acc.id.toString() === form.values.dst_id ?
            acc : prev, undefined
    )?.currency;

    return <>
        <Grid align='flex-end'>
            <Grid.Col span={12} sm={5} order={1}>
                <AccountInput label="from" disabled={src_disabled}
                    {...form.getInputProps('src_id')} />
            </Grid.Col>
            {!isPhone &&
                <Grid.Col span={2} order={2}>
                    <Center>
                        <TbArrowBigRightFilled size={32} />
                    </Center>
                </Grid.Col>
            }
            <Grid.Col span={12} sm={5} order={4} orderXs={3}>
                <AccountInput label="to" disabled={dst_disabled}
                    {...form.getInputProps('dst_id')} />
            </Grid.Col>
            <Grid.Col span={12} sm={5} order={3} orderXs={4}>
                <AmountInput withAsterisk
                    currency={src_curr}
                    {...form.getInputProps('src_amount')}
                />
            </Grid.Col>
            <Grid.Col span={3} sm={2} order={6} orderXs={5}>
                <Center>
                    <Switch color='red'
                        onLabel={<TbLock size={24} />}
                        offLabel={<TbLockOpen size={24} />}
                        checked={form.values.locked}
                        onChange={() => form.setFieldValue('locked', !form.values.locked)}
                    />
                </Center>
            </Grid.Col>
            <Grid.Col span={9} sm={5} order={5} orderXs={6}>
                <AmountInput withAsterisk disabled={form.values.locked}
                    currency={dst_curr}
                    {...form.getInputProps('dst_amount')}
                />
            </Grid.Col>
            <Grid.Col span={12} order={7}>
                <DateTimeInput form={form}
                // minDate={DateTime.min([source, dest].filter(value => !!value).map(value => DateTime.fromJSDate))}
                />
            </Grid.Col>
            <Grid.Col span={12} order={8}>
                <TextInput label="comment" {...form.getInputProps('comment')} />
            </Grid.Col>
        </Grid>
    </>
}

interface AddTransferModalProps {
    source?: AccountDeepQueryResult
    dest?: AccountDeepQueryResult
}

export const openAddTransferModal = async (props: OpenContextModal<AddTransferModalProps>) =>
    openContextModal({
        ...{
            modal: 'add_transfer',
            title: 'new account transfer',
            size: 'lg'
        },
        ...props,
        innerProps: props.innerProps
    })

export const AddTransferModal = ({ context, id, innerProps: { source, dest } }: ContextModalProps<AddTransferModalProps>) => {
    const initial = useTransferFormValues(undefined, source, dest);
    const form = useTransferForm(initial);

    const [loading, setLoading] = useState(false);

    const addTransfer = useAddTransfer();

    function handleSubmit(values: TransferRequest) {
        setLoading(true);
        addTransfer.mutate(values, {
            onSuccess: () => context.closeModal(id),
            onSettled: () => setLoading(false)
        });
    }

    return <form onSubmit={form.onSubmit(handleSubmit)}>
        <TransferForm form={form} src_disabled={source !== undefined} dst_disabled={source !== undefined} />
        <Button mt='lg' fullWidth type="submit" color='grape'
            loading={loading}>
            create
        </Button>
    </form>
}
