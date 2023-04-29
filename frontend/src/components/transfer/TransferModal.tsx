import { Button, Center, Grid, Switch, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useDisclosure } from "@mantine/hooks"
import { openContextModal } from "@mantine/modals"
import { ContextModalProps, OpenContextModal } from "@mantine/modals/lib/context"
import { DateTime, Duration } from "luxon"
import { useEffect, useState } from "react"
import { TbArrowBigRightFilled, TbLock, TbLockOpen } from 'react-icons/tb'
import { AccountDeepQueryResult, useAccounts } from "../../types/Account"
import findId from "../../helpers/findId"
import { useAddTransfer } from "../../hooks/api/useMutation"
import useIsPhone from "../../hooks/useIsPhone"
import Placeholder from "../Placeholder"
import AccountInput from "../input/AccountInput"
import AmountInput from "../input/AmountInput"
import DateTimeInput from "../input/DateTimeInput"

interface TransferFormProps {
    source?: AccountDeepQueryResult
    dest?: AccountDeepQueryResult
}

interface FormValues {
    src_id: string | undefined
    dst_id: string | undefined
    src_amount: number | undefined
    dst_amount: number | undefined
    date: Date
    time: string
    comment: string
}

export interface TransferFormValues {
    src_id: number
    dst_id: number
    src_amount: number
    dst_amount: number
    date_issued: string
    comment: string
}

type Transform = (fv: FormValues) => TransferFormValues | void

export default function TransferModal({ context, id, innerProps: { source, dest } }: ContextModalProps<TransferFormProps>) {
    const form = useForm<FormValues, Transform>({
        initialValues: {
            src_id: source?.id.toString(),
            dst_id: dest?.id.toString(),
            src_amount: undefined,
            dst_amount: undefined,
            date: new Date(),
            time: DateTime.now().toFormat("HH:mm"),
            comment: ''
        },
        validate: {
            src_id: value => value ? null : 'select source',
            dst_id: value => value ? null : 'select destination',
            src_amount: value => value ? null : 'enter amount',
            dst_amount: value => value ? null : 'enter amount',
            date: value => value ? null : 'enter date',
            time: value => value ? null : 'enter time'
        },
        transformValues: fv => {
            const src_currency = findId(accounts, parseInt(fv.src_id ?? ''))?.currency;
            const dst_currency = findId(accounts, parseInt(fv.dst_id ?? ''))?.currency;
            if (!src_currency || !dst_currency)
                return
            return ({
                src_id: parseInt(fv.src_id ?? ''),
                dst_id: parseInt(fv.dst_id ?? ''),
                src_amount: fv.src_amount ?? 0,
                dst_amount: fv.dst_amount ?? 0,
                date_issued: DateTime.fromJSDate(fv.date).startOf('day').plus(Duration.fromObject({
                    hour: DateTime.fromFormat(fv.time, "HH:mm").hour,
                    minute: DateTime.fromFormat(fv.time, "HH:mm").minute
                })).toISO({ includeOffset: false }),
                comment: fv.comment
            })
        }
    });

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
    function handleSubmit(values: TransferFormValues | void) {
        if (!values)
            return;
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
                    currency={findId(accounts, parseInt(form.values.src_id ?? ''))?.currency}
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
                    currency={findId(accounts, parseInt(form.values.src_id ?? ''))?.currency}
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
