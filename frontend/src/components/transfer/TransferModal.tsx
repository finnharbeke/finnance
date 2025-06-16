import { Button, Center, Grid, Popover, Switch, Text, TextInput, useMantineTheme } from "@mantine/core"
import { ContextModalProps } from "@mantine/modals/lib/context"
import { showNotification } from "@mantine/notifications"
import { useState } from "react"
import { TbArrowBigRightFilled, TbLock, TbLockOpen } from 'react-icons/tb'
import useIsPhone from "../../hooks/useIsPhone"
import { AccountDeepQueryResult, useAccounts } from "../../types/Account"
import { TransferFormType, TransferQueryResult, TransferRequest, useAddTransfer, useDeleteTransfer, useEditTransfer, useTransferForm, useTransferFormValues } from "../../types/Transfer"
import Placeholder from "../Placeholder"
import AccountInput from "../input/AccountInput"
import AmountInput from "../input/AmountInput"
import DateTimeInput from "../input/DateTimeInput"

interface TransferFormProps {
    form: TransferFormType
    src_disabled?: boolean
    dst_disabled?: boolean
}

const TransferForm = ({ form, src_disabled=false, dst_disabled=false }: TransferFormProps) => {

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
            <Grid.Col span={{base: 12, sm: 5}} order={1}>
                <AccountInput label="from" disabled={src_disabled}
                    data-autofocus={(!src_disabled) ? true : undefined}
                    {...form.getInputProps('src_id')} />
            </Grid.Col>
            {!isPhone &&
                <Grid.Col span={2} order={2}>
                    <Center>
                        <TbArrowBigRightFilled size={32} />
                    </Center>
                </Grid.Col>
            }
            <Grid.Col span={{base: 12, sm: 5}} order={{base: 4, xs: 3}}>
                <AccountInput label="to" disabled={dst_disabled}
                    data-autofocus={(src_disabled && !dst_disabled) ? true : undefined}
                    {...form.getInputProps('dst_id')} />
            </Grid.Col>
            <Grid.Col span={{base: 12, sm: 5}} order={{base: 3, xs: 4}}>
                <AmountInput withAsterisk currency={src_curr}
                    data-autofocus={(src_disabled && dst_disabled) ? true : undefined}
                    {...form.getInputProps('src_amount')}
                    />
            </Grid.Col>
            <Grid.Col span={{base: 3, sm: 2}} order={{base: 6, xs: 5}}>
                <Center>
                    <Switch color='red'
                        onLabel={<TbLock size={24} />}
                        offLabel={<TbLockOpen size={24} />}
                        checked={form.values.locked}
                        onChange={() => form.setFieldValue('locked', !form.values.locked)}
                    />
                </Center>
            </Grid.Col>
            <Grid.Col span={{base: 9, sm: 5}} order={{base: 5, xs: 6}}>
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

export interface AddTransferModalProps {
    source?: AccountDeepQueryResult
    dest?: AccountDeepQueryResult
}

export const AddTransferModal = ({ context, id, innerProps: { source, dest } }: ContextModalProps<AddTransferModalProps>) => {
    const theme = useMantineTheme();
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
        <Button mt='lg' fullWidth type="submit" color={theme.other.colors.transfer}
            loading={loading}>
            create
        </Button>
    </form>
}


interface EditTransferModalProps {
    transfer: TransferQueryResult
}

export const EditTransferModal = ({ context, id, innerProps: { transfer } }: ContextModalProps<EditTransferModalProps>) => {
    const theme = useMantineTheme();
    const initial = useTransferFormValues(transfer);
    const form = useTransferForm(initial);

    const [loading, setLoading] = useState(false);

    const editTransfer = useEditTransfer();
    const delTransfer = useDeleteTransfer(transfer.id);

    function handleSubmit(values: TransferRequest) {
        setLoading(true);
        editTransfer.mutate({ id: transfer.id, values }, {
            onSuccess: () => context.closeModal(id),
            onSettled: () => setLoading(false)
        });
    }

    return <form onSubmit={form.onSubmit(handleSubmit)}>
        <TransferForm form={form} />
        <Button mt='lg' fullWidth type="submit" color={theme.other.colors.transfer}
            loading={loading}>
            edit
        </Button>
        <Popover width='target'>
            <Popover.Target>
                <Button fullWidth mt="xl" color='red'
                    variant='light'>
                    delete transfer
                </Button>
            </Popover.Target>
            <Popover.Dropdown>
                <Text align='center' mb='sm'>are you sure?</Text>
                <Button fullWidth color='red' onClick={() => {
                    context.closeModal(id);
                    delTransfer.mutateAsync(undefined, {
                        onSuccess: () => showNotification({
                            color: 'green',
                            message: `deleted transfer #${transfer.id}`,
                            autoClose: 2000
                        })
                    });
                }}>
                    delete
                </Button>
            </Popover.Dropdown>
        </Popover>
    </form>
}
