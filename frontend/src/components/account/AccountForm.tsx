import { Collapse, ColorInput, ColorSwatch, Grid, Group, Paper, Select, Skeleton, TextInput, Title, createStyles } from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { useForm } from "@mantine/form"
import { useDisclosure } from "@mantine/hooks"
import { DateTime } from "luxon"
import { useEffect } from "react"
import { TbChevronDown, TbChevronRight, TbChevronUp, TbDeviceFloppy, TbRotate2 } from "react-icons/tb"
import { Link } from "react-router-dom"
import { AccountDeep } from "../../Types/Account"
import { useEditAccount } from "../../hooks/api/useMutation"
import { useCurrencies } from "../../hooks/api/useQuery"
import AmountInput from "../Inputs/AmountInput"
import { PrimaryIcon, RedIcon, SecondaryIcon } from "../Inputs/Icons"
import { AccountFormValues, TransformedAccountFormValues } from "../modals/AccountModal"
import { useAccountFormList } from "./AccountFormList"
import { amountToInteger, integerToAmount } from "../../helpers/convert"
import findId from "../../helpers/findId"

type Transform = (values: AccountFormValues) => TransformedAccountFormValues

const useStyles = createStyles((theme) => ({
    AccountLink: {
        textDecoration: 'none',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    }
}));

export function AccountForm({ data, ix, order }: { data: AccountDeep, ix: number, order: number }) {
    const currencies = useCurrencies();

    const [open, { toggle }] = useDisclosure(false);
    const [editing, { open: startEdit, close: endEdit }] = useDisclosure(false);

    const initials = () => ({
        desc: data.desc,
        starting_saldo: integerToAmount(data.starting_saldo, data.currency),
        date_created: DateTime.fromISO(data.date_created).toJSDate(),
        color: data.color,
        currency_id: data.currency_id.toString()
    })

    const form = useForm<AccountFormValues, Transform>({
        initialValues: initials(),

        transformValues: (values: AccountFormValues) => {
            if (!currencies.isSuccess)
                throw new Error('currencies not fetched');
            const c_id = parseInt(values.currency_id);
            const currency = findId(currencies.data, c_id);
            if (!currency)
                throw new Error('invalid currency_id');
            return ({
                ...values,
                currency_id: parseInt(values.currency_id),
                starting_saldo: amountToInteger(values.starting_saldo, currency),
                date_created: DateTime.fromJSDate(values.date_created).toISO({ includeOffset: false }),
            })
        },
    })

    const { moveUp, moveDown } = useAccountFormList();

    const editAccount = useEditAccount();

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

    if (!currencies.isSuccess)
        return <Skeleton height={100}></Skeleton>
    return <Paper withBorder p='xs'>
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid gutter='xs' align='center'>
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
                <Grid align='flex-end'>
                    <Grid.Col md={3} sm={6} xs={12}>
                        <ColorInput label="color"
                            {...form.getInputProps('color')}
                        />
                    </Grid.Col>
                    <Grid.Col md={3} sm={6} xs={12}>
                        <DateInput label="tracking since"
                            {...form.getInputProps('date_created')}
                        />
                    </Grid.Col>
                    <Grid.Col md={3} sm={6} xs={12}>
                        <Select label="currency"
                            data={currencies.isLoading ? [] : currencies.data.map(
                                cur => ({
                                    value: cur.id.toString(),
                                    label: cur.code,
                                })
                            )}
                            {...form.getInputProps('currency_id')}
                        />
                    </Grid.Col>
                    <Grid.Col md={3} sm={6} xs={12}>
                        <AmountInput label={`saldo at ${DateTime.fromJSDate(form.values.date_created).toFormat("dd.LL.yy")}`}
                            currency={
                                currencies.data.filter(cur => cur.id.toString() === form.values.currency_id)[0]
                            }
                            {...form.getInputProps('starting_saldo')}
                        />
                    </Grid.Col>
                </Grid>
            </Collapse>
        </form>
    </Paper>
}