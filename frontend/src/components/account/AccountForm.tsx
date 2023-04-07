import { Collapse, ColorInput, ColorSwatch, Grid, Group, Paper, Select, Skeleton, TextInput, Title, createStyles } from "@mantine/core"
import { DateInput, DatePickerInput } from "@mantine/dates"
import { UseFormReturnType, useForm } from "@mantine/form"
import { useDisclosure } from "@mantine/hooks"
import { DateTime } from "luxon"
import { useEffect } from "react"
import { TbChevronDown, TbChevronRight, TbChevronUp, TbDeviceFloppy, TbRotate2 } from "react-icons/tb"
import { Link } from "react-router-dom"
import { AccountDeep } from "../../Types/Account"
import { CurrencyFlat } from "../../Types/Currency"
import { amountToInteger, integerToAmount } from "../../helpers/convert"
import findId from "../../helpers/findId"
import { useEditAccount } from "../../hooks/api/useMutation"
import { useCurrencies } from "../../hooks/api/useQuery"
import AmountInput from "../Inputs/AmountInput"
import { PrimaryIcon, RedIcon, SecondaryIcon } from "../Inputs/Icons"
import { useAccountFormList } from "./AccountList"
import useIsPhone from "../../hooks/useIsPhone"
import { FormValidateInput } from "@mantine/form/lib/types"
import { UseQueryResult } from "@tanstack/react-query"

type Transform = (values: AccountFormValues) => TransformedAccountFormValues

const useStyles = createStyles((theme) => ({
    AccountLink: {
        textDecoration: 'none',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    }
}));

export function AccountEdit({ data, ix }: { data: AccountDeep, ix: number }) {
    const currencies = useCurrencies();

    const [open, { toggle }] = useDisclosure(false);
    
    const initials = () => ({
        desc: data.desc,
        starting_saldo: integerToAmount(data.starting_saldo, data.currency),
        date_created: DateTime.fromISO(data.date_created).toJSDate(),
        color: data.color,
        currency_id: data.currency_id.toString()
    })
    
    const form = useForm<AccountFormValues, Transform>({
        initialValues: initials(),
        validate: accountFormValidate,
        transformValues: (values: AccountFormValues) => accountFormTransform(values, currencies),
    })
    
    const { moveUp, moveDown } = useAccountFormList();
    
    const editAccount = useEditAccount();
    const [editing, { open: startEdit, close: endEdit }] = useDisclosure(false);

    const reset = () => {
        form.setValues(initials());
        form.resetDirty(initials());
        // close();
    }

    // disable: missing dependency form, but should only reset
    // on change of data
    // eslint-disable-next-line
    useEffect(reset, [data.desc, data.starting_saldo,
    data.date_created, data.color, data.currency_id])

    const handleSubmit = (values: TransformedAccountFormValues) => {
        startEdit();
        editAccount.mutate(
            { id: data.id, values },
            {
                onSuccess: () => {
                    editAccount.reset();
                }, onSettled: endEdit
            }
        );
    }

    const { classes } = useStyles();
    const isPhone = useIsPhone();

    if (!currencies.isSuccess)
        return <Skeleton height={100}></Skeleton>
    return <Paper withBorder p='xs'>
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid gutter={isPhone ? 'xs' : undefined } align='center'>
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
                        <Link to={`${data.id}`} className={classes.AccountLink}>
                            <Title order={3} lineClamp={1} >
                                {form.values.desc}
                            </Title>
                        </Link>
                    }
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
                                    onClick={reset}
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

export const accountFormValidate: FormValidateInput<AccountFormValues> = {
    desc: (val) => (val && val.length > 0) ? null : "enter account name",
    starting_saldo: (val) => val !== undefined ? null : "enter starting saldo",
    date_created: (val) => val ? null : "enter starting date",
    color: (val) => (val && val.length === 7) ? null : "enter hex color",
    currency_id: (val) => (val && val.length > 0) ? null : "choose currency",
}

export const accountFormTransform = (values: AccountFormValues, currencies: UseQueryResult<CurrencyFlat[], Response>) => {
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
}

interface AccountFormProps {
    form: UseFormReturnType<AccountFormValues, Transform>
    currencies: CurrencyFlat[]
    modal: boolean
}

export const AccountForm = ({ form, currencies, modal }: AccountFormProps) => {
    const isPhone = useIsPhone();

    return (
        <Grid align='flex-end'>
            {modal &&
                <Grid.Col span={12} order={0}>
                    <TextInput label="account name" withAsterisk

                        {...form.getInputProps('desc')}
                    />
                </Grid.Col>
            }
            <Grid.Col md={modal ? undefined : 3} sm={6} xs={12} orderXs={1} order={modal ? 2 : 1}>
                <ColorInput
                    disallowInput={isPhone}
                    label="color" withAsterisk={modal}

                    {...form.getInputProps('color')}
                />
            </Grid.Col>
            <Grid.Col md={modal ? undefined : 3} sm={6} xs={12} orderXs={2} order={modal ? 1 : 2}>
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
            <Grid.Col md={modal ? undefined : 3} sm={6} xs={12} order={3}>
                <Select label="currency" withAsterisk={modal}
                    searchable={!isPhone}
                    placeholder="select currency"
                    data={currencies.map(
                        cur => ({
                            value: cur.id.toString(),
                            label: cur.code,
                        })
                    )}
                    {...form.getInputProps('currency_id')}
                />
            </Grid.Col>
            <Grid.Col md={modal ? undefined : 3} sm={6} xs={12} order={3}>
                <AmountInput withAsterisk={modal}
                    label={form.values.date_created ?
                        `saldo at ${DateTime.fromJSDate(form.values.date_created).toFormat("dd.LL.yy")}`
                        : 'saldo at start'}
                    currency={findId(currencies, parseInt(form.values.currency_id))}
                    {...form.getInputProps('starting_saldo')}
                />
            </Grid.Col>
        </Grid>
    )
}