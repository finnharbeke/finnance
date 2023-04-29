import { Button, Center, Grid, Switch, TextInput } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { openContextModal } from "@mantine/modals"
import { ContextModalProps, OpenContextModal } from "@mantine/modals/lib/context"
import { useEffect, useState } from "react"
import { TbArrowBigRightFilled, TbLock, TbLockOpen } from 'react-icons/tb'
import useIsPhone from "../../hooks/useIsPhone"
import { AccountDeepQueryResult, useAccounts } from "../../types/Account"
import { TransferRequest, useAddTransfer, useTransferForm, useTransferFormValues } from "../../types/Transfer"
import Placeholder from "../Placeholder"
import AccountInput from "../input/AccountInput"
import AmountInput from "../input/AmountInput"
import DateTimeInput from "../input/DateTimeInput"

interface TransferFormProps {
    source?: AccountDeepQueryResult
    dest?: AccountDeepQueryResult
}

export default function TransferModal({ context, id, innerProps: { source, dest } }: ContextModalProps<TransferFormProps>) {
    const initial = useTransferFormValues(undefined, source, dest);
    const form = useTransferForm(initial);

    const query = useAccounts();
    const isPhone = useIsPhone();
    const [locked, { toggle }] = useDisclosure(true);
    const [loading, setLoading] = useState(false);

    const addTransfer = useAddTransfer();

    useEffect(() => {
        if (locked)
            form.setFieldValue('dst_amount', form.values.src_amount)
        // eslint-disable-next-line
    }, [locked, form.values.src_amount])

    if (!query.isSuccess)
        return <Placeholder height={300} queries={[query]} />

    const accounts = query.data;

    const src_curr = accounts.reduce<AccountDeepQueryResult | undefined>(
        (prev, acc) => acc.id.toString() === form.values.src_id ?
            acc : prev, undefined
    )?.currency;
    const dst_curr = accounts.reduce<AccountDeepQueryResult | undefined>(
        (prev, acc) => acc.id.toString() === form.values.dst_id ?
            acc : prev, undefined
    )?.currency;

    function handleSubmit(values: TransferRequest) {
        setLoading(true);
        addTransfer.mutate(values, {
            onSuccess: () => context.closeModal(id),
            onSettled: () => setLoading(false)
        });
    }

    return <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid align='flex-end'>
            <Grid.Col span={12} sm={5} order={1}>
                <AccountInput label="from" disabled={source !== undefined}
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
                <AccountInput label="to" disabled={dest !== undefined}
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
                        checked={locked}
                        onChange={toggle}
                    />
                </Center>
            </Grid.Col>
            <Grid.Col span={9} sm={5} order={5} orderXs={6}>
                <AmountInput withAsterisk disabled={locked}
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
        <Button mt='lg' fullWidth type="submit" color='grape'
            loading={loading}>
            create
        </Button>
    </form>
}

export const openTransferModal = async (props: OpenContextModal<TransferFormProps>) =>
    openContextModal({
        ...{
            modal: 'transfer',
            title: 'new account transfer',
            size: 'lg'
        },
        ...props,
        innerProps: props.innerProps
    })
