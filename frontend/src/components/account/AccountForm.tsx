import { Collapse, ColorInput, ColorSwatch, Grid, Group, Paper, Select, Skeleton, TextInput, Title } from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { useForm } from "@mantine/form"
import { useDisclosure } from "@mantine/hooks"
import { DateTime } from "luxon"
import { TbChevronDown, TbChevronRight, TbChevronUp, TbDeviceFloppy, TbRotate2 } from "react-icons/tb"
import { useEditAccount } from "../../hooks/useMutation"
import { useCurrencies } from "../../hooks/useQuery"
import { AccountDeep } from "../../Types/Account"
import AmountInput from "../Inputs/AmountInput"
import { PrimaryIcon, RedIcon, SecondaryIcon } from "../Inputs/Icons"
import { useAccountFormList } from "./AccountFormList"

export interface AccountFormValues {
    desc: string
    starting_saldo: number
    date_created: Date
    color: string
    currency_id: number
}

export interface TransformedAccountFormValues {
    desc: string
    starting_saldo: number
    date_created: string
    color: string
    currency_id: number
}

type Transform = (values: AccountFormValues) => TransformedAccountFormValues

export function AccountForm({ data, ix }: { data: AccountDeep, ix: number }) {
    const currencies = useCurrencies();

    const [open, { toggle }] = useDisclosure(false);
    const [editing, { open: startEdit, close: endEdit }] = useDisclosure(false);

    const form = useForm<AccountFormValues, Transform>({
        initialValues: {
            desc: data.desc,
            starting_saldo: data.starting_saldo,
            date_created: DateTime.fromISO(data.date_created).toJSDate(),
            color: data.color,
            currency_id: data.currency_id,
        },

        transformValues: (values: AccountFormValues) => ({
            ...values,
            date_created: DateTime.fromJSDate(values.date_created).toISO({ includeOffset: false }),
        })
    })

    const { moveUp, moveDown } = useAccountFormList();

    const editAccount = useEditAccount();

    const handleSubmit = (values: TransformedAccountFormValues) => {
        startEdit();
        editAccount.mutate({id: data.id, values});
        endEdit();
    }

    if (!currencies.isSuccess)
        return <Skeleton height={100}></Skeleton>
    return <Paper withBorder p='xs'>
        <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
            <Grid.Col span='auto'>
                <Group spacing='xs'>
                    <SecondaryIcon
                        icon={open ? TbChevronDown : TbChevronRight}
                        onClick={toggle}
                    />
                    <ColorSwatch color={form.values.color} />
                    { open ?
                        <TextInput {...form.getInputProps('desc')}/>
                        :
                        <Title order={3}>{form.values.desc}</Title>
                    }
                </Group>
                {/* <Input component={Title} {...form.getInputProps('desc')}/> */}
                {/* <input/> */}
            </Grid.Col>
            <Grid.Col span='content'>
                <Group position='right' spacing='xs'>
                    {
                        form.isDirty() &&
                        <>
                            <PrimaryIcon type='submit' icon={TbDeviceFloppy} loading={editing}
                                tooltip='save'
                            />
                            <RedIcon icon={TbRotate2}
                                onClick={() => form.reset()}
                                tooltip='discard'
                            />
                        </>
                    }
                    <SecondaryIcon icon={TbChevronUp}
                        onClick={() => moveUp(ix)}
                    />
                    <SecondaryIcon icon={TbChevronDown}
                        onClick={() => moveDown(ix)}
                    />
                </Group>
            </Grid.Col>
        </Grid>
        <Collapse in={open}>
            <Grid align='flex-end'>
                <Grid.Col md={3} sm={6} xs={12}>
                    <ColorInput label="color"
                        {...form.getInputProps('color')}
                    />
                </Grid.Col>
                <Grid.Col md={3} sm={6} xs={12}>
                    <DatePickerInput label="tracking since"
                        {...form.getInputProps('date_created')}
                    />
                </Grid.Col>
                <Grid.Col md={3} sm={6} xs={12}>
                    <Select label="currency"
                        data={currencies.isLoading ? [] : currencies.data.map(
                            cur => ({
                                value: cur.id.toFixed(0),
                                label: cur.code,
                            })
                        )}
                        {...form.getInputProps('currency_id')}
                    />
                </Grid.Col>
                <Grid.Col md={3} sm={6} xs={12}>
                    <AmountInput label={`saldo at ${DateTime.fromJSDate(form.values.date_created).toFormat("dd.LL.yy")}`}
                        currency={
                            currencies.data.filter(cur => cur.id === form.values.currency_id)[0]
                        }
                        {...form.getInputProps('starting_saldo')}
                    />
                </Grid.Col>
            </Grid>
        </Collapse>
        </form>
    </Paper>
}