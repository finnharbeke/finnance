import { ActionIcon, Button, ColorInput, Grid, Group, Paper, Select, Skeleton, Title, useMantineTheme } from "@mantine/core"
import { DatePicker } from "@mantine/dates"
import { useForm } from "@mantine/form"
import { DateTime } from "luxon"
import { useEffect } from "react"
import { TbChevronDown, TbChevronUp, TbDeviceFloppy } from "react-icons/tb"
import { useCurrencies } from "../../hooks/useQuery"
import { AccountDeep } from "../../Types/Account"
import { useAccountFormList } from "./AccountFormList"
import AmountInput from "../Inputs/AmountInput"

export interface AccountFormValues {
    ix: number
    id: number
    desc: string
    starting_saldo: number
    date_created: Date
    color: string
    currency_id: number
    order: number
}

export function AccountForm({ data, ix }: { data: AccountDeep, ix: number }) {
    const theme = useMantineTheme();
    const currencies = useCurrencies();

    const form = useForm<AccountFormValues>({
        initialValues: {
            ix, id: data.id,
            desc: data.desc,
            starting_saldo: data.starting_saldo,
            date_created: DateTime.fromISO(data.date_created).toJSDate(),
            color: data.color,
            currency_id: data.currency_id,
            order: data.order
        }
    })

    const { setItem, moveUp, moveDown } = useAccountFormList();

    // 'warning': missing dependencies, but dk how else to solve
    // eslint-disable-next-line
    useEffect(() => setItem(ix, form), []);

    if (!currencies.isSuccess)
        return <Skeleton height={100}></Skeleton>
    return <Grid.Col span={12} order={form.values.ix}>
        <Paper withBorder p='xs' mb='sm'>
            <Grid align='flex-end'>
                <Grid.Col span={1}>
                    <Title order={3} color='dimmed'>#{form.values.ix}</Title>
                </Grid.Col>
                <Grid.Col span={9}>

                    <Title order={3}>{form.values.desc}</Title>
                    {/* <Input component={Title} {...form.getInputProps('desc')}/> */}
                    {/* <input/> */}
                </Grid.Col>
                <Grid.Col span={2}>
                    <Group position='right' spacing='xs'>
                        {
                            form.isDirty() &&
                            <ActionIcon variant='filled' type='submit' color={theme.primaryColor}
                                onClick={form.onSubmit(() => console.log('hi'))}>
                                <TbDeviceFloppy />
                            </ActionIcon>
                        }
                        <ActionIcon
                            onClick={() => moveUp(form.values.ix)}>
                            <TbChevronUp />
                        </ActionIcon>
                        <ActionIcon
                            onClick={() => moveDown(form.values.ix)}>
                            <TbChevronDown />
                        </ActionIcon>
                    </Group>
                </Grid.Col>
                <Grid.Col md={3} sm={6} xs={12}>
                    <ColorInput
                        {...form.getInputProps('color')}
                    />
                </Grid.Col>
                <Grid.Col md={3} sm={6} xs={12}>
                    <DatePicker
                        {...form.getInputProps('date_created')}
                    />
                </Grid.Col>
                <Grid.Col md={3} sm={6} xs={12}>
                    <Select label="currency"
                        data={currencies.isLoading ? [] : currencies.data.map(
                            cur => ({
                                value: cur.id,
                                label: cur.code,
                            })
                        )}
                        {...form.getInputProps('currency_id')}
                    />
                </Grid.Col>
                <Grid.Col md={3} sm={6} xs={12}>
                    <AmountInput label="saldo"
                        currency={
                            currencies.data.filter(cur => cur.id === form.values.currency_id)[0]
                        }
                        {...form.getInputProps('starting_saldo')}
                    />
                </Grid.Col>
            </Grid>
        </Paper>
    </Grid.Col>
}