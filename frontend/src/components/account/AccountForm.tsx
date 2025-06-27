import { Collapse, ColorInput, ColorSwatch, Grid, Group, Paper, Skeleton, TextInput, Title } from "@mantine/core"
import { DateInput, DatePickerInput } from "@mantine/dates"
import { UseFormReturnType } from "@mantine/form"
import { useDisclosure } from "@mantine/hooks"
import { DateTime } from "luxon"
import { TbChevronDown, TbChevronRight, TbChevronUp, TbDeviceFloppy, TbRotate2 } from "react-icons/tb"
import { Link } from "react-router-dom"
import useIsPhone from "../../hooks/useIsPhone"
import { AccountDeepQueryResult, AccountFormValues, AccountRequest, AccountTransform, useAccountForm, useAccountFormValues, useEditAccount } from "../../types/Account"
import { CurrencyQueryResult, useCurrencies } from "../../types/Currency"
import { PrimaryIcon, RedIcon, SecondaryIcon } from "../Icons"
import { OrderCellProps } from "../OrderForm"
import AmountInput from "../input/AmountInput"
import CurrencyInput from "../input/CurrencyInput"

export function AccountEdit({ data, ix, orderForm: { moveUp, moveDown } }: OrderCellProps<AccountDeepQueryResult>) {
    const currencies = useCurrencies();

    const [open, { toggle }] = useDisclosure(false);

    const initial = useAccountFormValues(data);

    const form = useAccountForm(initial);

    const editAccount = useEditAccount();
    const [editing, { open: startEdit, close: endEdit }] = useDisclosure(false);

    const handleSubmit = (values: AccountRequest) => {
        startEdit();
        editAccount.mutate(
            { id: data.id, values },
            {
                onSuccess: () => {
                    editAccount.reset();
                }, onSettled: () => {
                    endEdit();
                    form.resetDirty();
                }
            }
        );
    }
    const isPhone = useIsPhone();

    if (!currencies.isSuccess)
        return <Skeleton height={100}></Skeleton>
    return <Paper p='xs'>
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid gutter={isPhone ? 'xs' : undefined} align='center'>
                <Grid.Col span='content'>
                    <SecondaryIcon
                        icon={open ? TbChevronDown : TbChevronRight}
                        onClick={toggle}
                    />
                </Grid.Col>
                <Grid.Col span='content'>
                    <ColorSwatch color={form.values.color} size={20} />
                </Grid.Col>
                <Grid.Col span='auto'>
                    {open ?
                        <TextInput {...form.getInputProps('desc')} />
                        :
                        <Link to={`${data.id}`}
                            style={{
                                textDecoration: 'none',
                                color: 'light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-0))'
                            }}>
                            <Title order={3} lineClamp={1} >
                                {form.values.desc}
                            </Title>
                        </Link>
                    }
                </Grid.Col>
                <Grid.Col span='content'>
                    <Group justify='flex-end' gap='xs'>
                        {
                            form.isDirty() &&
                            <>
                                <PrimaryIcon type='submit' icon={TbDeviceFloppy} loading={editing}
                                    tooltip='save'
                                />
                                <RedIcon icon={TbRotate2}
                                    onClick={() => form.setValues(initial)}
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
                <AccountForm form={form} currencies={currencies.data} modal={false} />
            </Collapse>
        </form>
    </Paper>
}

interface AccountFormProps {
    form: UseFormReturnType<AccountFormValues, AccountTransform>
    currencies: CurrencyQueryResult[]
    modal: boolean
}

export const AccountForm = ({ form, currencies, modal }: AccountFormProps) => {
    const isPhone = useIsPhone();

    const c_id = form.values.currency_id;
    const currency = currencies.reduce<CurrencyQueryResult | undefined>(
        (prev, cur) =>
            cur.id.toString() === c_id ? cur : prev, undefined
    );

    return (
        <Grid align='flex-start'>
            {modal &&
                <Grid.Col span={12} order={0}>
                    <TextInput label="account name" withAsterisk data-autofocus
                        {...form.getInputProps('desc')}
                    />
                </Grid.Col>
            }
            <Grid.Col span={{md: modal ? undefined : 3, sm:6, xs: 12}} order={{base: modal ? 2 : 1, xs: 1}}>
                <ColorInput withAsterisk={modal} label="color"
                    {...form.getInputProps('color')}
                />
            </Grid.Col>
            <Grid.Col span={{md: modal ? undefined : 3, sm:6, xs: 12}} order={{base: modal ? 1 : 2, xs: 2}}>
                {
                    isPhone ?
                        <DatePickerInput
                            popoverProps={{ withinPortal: modal }}
                            label="tracking since"
                            withAsterisk={modal}

                            {...form.getInputProps('date_created')}
                        />
                        :
                        <DateInput
                            popoverProps={{ withinPortal: modal }}
                            label="tracking since"
                            withAsterisk={modal}

                            {...form.getInputProps('date_created')}
                        />

                }
            </Grid.Col>
            <Grid.Col span={{md: modal ? undefined : 3, sm:6, xs: 12}} order={3}>
                <CurrencyInput label="currency" withAsterisk={modal}
                    {...form.getInputProps('currency_id')}
                />
            </Grid.Col>
            <Grid.Col span={{md: modal ? undefined : 3, sm:6, xs: 12}} order={3}>
                <AmountInput withAsterisk={modal}
                    label={form.values.date_created ?
                        `saldo at ${DateTime.fromJSDate(form.values.date_created).toFormat("dd.LL.yy")}`
                        : 'saldo at start'}
                    currency={currency}
                    {...form.getInputProps('starting_saldo')}
                />
            </Grid.Col>
        </Grid>
    )
}