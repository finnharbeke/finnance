import { ActionIcon, Collapse, ColorInput, ColorSwatch, Grid, Group, Paper, Select, Skeleton, Title, Tooltip, useMantineTheme } from "@mantine/core"
import { DatePicker } from "@mantine/dates"
import { useForm } from "@mantine/form"
import { useDisclosure } from "@mantine/hooks"
import { DateTime } from "luxon"
import { useEffect } from "react"
import { TbChevronDown, TbChevronRight, TbChevronUp, TbDeviceFloppy, TbRotate, TbRotate2, TbX } from "react-icons/tb"
import { useCurrencies } from "../../hooks/useQuery"
import { AccountDeep } from "../../Types/Account"
import AmountInput from "../Inputs/AmountInput"
import { PrimaryIcon, RedIcon, SecondaryIcon } from "../Inputs/Icons"
import { useAccountFormList } from "./AccountFormList"

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
    const currencies = useCurrencies();

    const [open, { toggle }] = useDisclosure(false);

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
        <Paper withBorder p='xs'>
            <Grid>
                <Grid.Col span='auto'>
                    <Group spacing='xs'>
                        <SecondaryIcon
                            icon={open ? TbChevronDown : TbChevronRight}
                            onClick={toggle}
                        />
                        <ColorSwatch color={form.values.color} />
                        <Title order={3}>{form.values.desc}</Title>
                    </Group>
                    {/* <Input component={Title} {...form.getInputProps('desc')}/> */}
                    {/* <input/> */}
                </Grid.Col>
                <Grid.Col span='content'>
                    <Group position='right' spacing='xs'>
                        {
                            form.isDirty() &&
                            <>
                                <PrimaryIcon type='submit' icon={TbDeviceFloppy}
                                    onClick={form.onSubmit(() => console.log('hi'))}
                                    tooltip='save'
                                />
                                <RedIcon icon={TbRotate2}
                                    onClick={form.reset}
                                    tooltip='discard'
                                />
                            </>
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
            </Grid>
            <Collapse in={open}>
                <Grid align='flex-end'>
                    <Grid.Col md={3} sm={6} xs={12}>
                        <ColorInput label="color"
                            {...form.getInputProps('color')}
                        />
                    </Grid.Col>
                    <Grid.Col md={3} sm={6} xs={12}>
                        <DatePicker label="tracking since"
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
            </Collapse>
        </Paper>
    </Grid.Col>
}