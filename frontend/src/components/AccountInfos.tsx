import { Skeleton, Paper, Grid, Title, Group, ActionIcon, ColorInput, Select } from "@mantine/core"
import { DatePicker } from "@mantine/dates"
import { useForm } from "@mantine/form"
import { DateTime } from "luxon"
import { TbChevronUp, TbChevronDown } from "react-icons/tb"
import { useCurrencies } from "../hooks/useQuery"
import { AccountDeep } from "../Types/Account"
import AmountInput from "./Inputs/AmountInput"

interface AccountFormValues {
    desc: string
    starting_saldo: number
    date_created: Date
    color: string
    currency_id: number
}

export default function AccountInfos({ data, ix }: { data: AccountDeep, ix: number }) {

    const form = useForm<AccountFormValues>({
        initialValues: {
            desc: data.desc,
            starting_saldo: data.starting_saldo,
            date_created: DateTime.fromISO(data.date_created).toJSDate(),
            color: data.color,
            currency_id: data.currency_id
        }
    })

    const currencies = useCurrencies();

    if (!currencies.isSuccess)
        return <Skeleton height={100}></Skeleton>
    return <Paper withBorder p='xs' mb='sm'>
        <form>
            <Grid>
                <Grid.Col span={1}>
                    <Title order={3} color='dimmed'>#{ix}</Title>
                </Grid.Col>
                <Grid.Col span='auto'>

                    <Title order={3}>{form.values.desc}</Title>
                    {/* <Input component={Title} {...form.getInputProps('desc')}/> */}
                    {/* <input/> */}
                </Grid.Col>
                <Grid.Col span={1}>
                    <Group grow spacing={0}>
                        <ActionIcon >
                            <TbChevronUp />
                        </ActionIcon>
                        <ActionIcon>
                            <TbChevronDown />
                        </ActionIcon>
                    </Group>
                </Grid.Col>
            </Grid>
            <Grid>
                <Grid.Col span={3}>
                    <ColorInput
                        {...form.getInputProps('color')}
                    />
                </Grid.Col>
                <Grid.Col span={3}>
                    <DatePicker
                        {...form.getInputProps('date_created')}
                    />
                </Grid.Col>
                <Grid.Col span={3}>
                    <Select
                        data={currencies.isLoading ? [] : currencies.data.map(
                            cur => ({
                                value: cur.id,
                                label: cur.code,
                            })
                        )}
                        {...form.getInputProps('currency_id')}
                    />
                </Grid.Col>
                <Grid.Col span={3}>
                    <AmountInput
                        currency={
                            currencies.data.filter(cur => cur.id === form.values.currency_id)[0]
                        }
                        {...form.getInputProps('starting_saldo')}
                    />
                </Grid.Col>
            </Grid>
        </form>
    </Paper>
}