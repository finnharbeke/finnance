import { ActionIcon, Autocomplete, Button, createStyles, Divider, Grid, Group, Input, MantineTheme, NumberInput, Select, Switch, TextInput, useMantineTheme } from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { closeModal, ContextModalProps, openContextModal } from "@mantine/modals";
import { OpenContextModal } from "@mantine/modals/lib/context";
import { IconArrowWaveRightUp, IconEraser, IconMinus, IconPlus, IconTrendingDown, IconTrendingUp } from "@tabler/icons";
import { DateTime, Duration } from "luxon";
import { useSubmit } from "react-router-dom";
import { formatDiagnostic } from "typescript";
import { throwOrReturnFromResponse } from "../../contexts/ErrorHandlerProvider";
import { AccountDeep } from "../../Types/Account";
import { AgentFlat } from "../../Types/Agent";
import { CategoryFlat } from "../../Types/Category";
import { CurrencyFlat } from "../../Types/Currency";

type OpenTransactionModalProps = {
    currency?: CurrencyFlat,
    account?: AccountDeep
}

type TransactionModalProps = {
    currency?: CurrencyFlat,
    account?: AccountDeep,
    agents: AgentFlat[],
    categories: CategoryFlat[]
}

export const openTransactionModal = async (props?: OpenContextModal<OpenTransactionModalProps>) => {
    fetch('/api/agents', {
        signal: AbortSignal.timeout(3000)
    }).then(throwOrReturnFromResponse)
        .then((agents: AgentFlat[]) =>
            fetch('/api/categories', {
                signal: AbortSignal.timeout(3000)
            }).then(throwOrReturnFromResponse)
                .then((categories: CategoryFlat[]) =>
                    openContextModal({
                        ...{
                            modal: 'transaction',
                            title: 'new transaction',
                        },
                        ...props,
                        innerProps: {
                            ...{
                                agents,
                                categories
                            },
                            ...props.innerProps
                        }
                    })
                )
        )
    // TODO catch this!

}

interface RecordPost {
    amount: number,
    category_id: number,
}

interface Record extends RecordPost {
    type: 'record'
    ix: number
}

interface FlowPost {
    amount: number,
    agent: string,
}

interface Flow extends FlowPost {
    type: 'flow'
    ix: number
}

type Item = Record | Flow;

const isFlow = (val: Item): val is Flow => val.type === 'flow';
const isRecord = (val: Item): val is Record => val.type === 'record';

interface FormValues {
    account_id: number
    date: Date
    time: Date
    amount: number
    isExpense: boolean
    agent: string
    isDirect: boolean
    n_flows: number
    n_records: number
    items: Item[]
    comment: string
}

interface transformedFormValues {
    account_id: number
    date_issued: string
    amount: number
    is_expense: boolean
    agent: string
    comment: string
    flows: {
        amount: number
        agent: string
    }[],
    records: {
        amount: number
        category_id: number
    }[]
}

type Transform = (values: FormValues) => transformedFormValues

export const TransactionModal = ({ context, id, innerProps }: ContextModalProps<TransactionModalProps>) => {
    const useStyles = createStyles((theme: MantineTheme) => {
        const inc = theme.colors.blue[
            theme.colorScheme === 'light' ? 6 : 5
        ];
        const exp = theme.colors.red[
            theme.colorScheme === 'light' ? 6 : 5
        ];
        const off = 0.5;
        return {
            incExpButton: {
                border: 0
            },
            incomeOff: {
                backgroundColor: theme.fn.rgba(inc, off),
                '&:hover': {
                    backgroundColor: inc,
                }
            },
            incomeOn: {
                backgroundColor: inc,
                '&:hover': {
                    backgroundColor: inc
                }
            },
            expenseOff: {
                backgroundColor: theme.fn.rgba(exp, off),
                '&:hover': {
                    backgroundColor: exp
                }
            },
            expenseOn: {
                backgroundColor: exp,
                '&:hover': {
                    backgroundColor: exp
                }
            },
        }
    });

    const theme = useMantineTheme();
    const { classes, cx } = useStyles();
    const { currency, agents, categories, account } = innerProps;

    const form = useForm<FormValues, Transform>({
        initialValues: {
            account_id: account.id,
            date: null,
            time: new Date(),
            amount: null,
            isExpense: true,
            agent: '',
            isDirect: false,
            n_flows: 0,
            n_records: 0,
            items: [],
            comment: '',
        },
        validate: {
            date: val => val === null ? 'choose date' : null,
            time: (val, vals) => val === null ? 'choose time' :
                DateTime.fromJSDate(vals.date).hasSame(DateTime.now(), 'day') && DateTime.now() < DateTime.fromJSDate(val) ?
                    'in the future' : null,
            agent: desc => desc.length === 0 ? "at least one character" : null,
            amount: val => val === null ? 'enter amount' : val === 0 ? 'non-zero amount' : null,
            // count flows
            isDirect: (val, vals) => !val && vals.items.length === 0 ? 'minimum one record / flow' : null,
            items: {
                agent: (desc, values, path) => {
                    const i = parseInt(path.replace(/^\D+/g, ''));
                    if (!isFlow(values.items[i]))
                        return null;
                    if (desc.length === 0)
                        return 'at least one character';
                    for (let j = 0; j < i; j++) {
                        const item = values.items[j];
                        if (isFlow(item) && item.agent === desc)
                            return 'duplicate agent';
                    }
                    return null;
                },
                category_id: (id, values, path) => {
                    const i = parseInt(path.replace(/^\D+/g, ''));
                    if (isFlow(values.items[i]))
                        return null;
                    if (id === null)
                        return 'select category';
                    for (let j = 0; j < i; j++) {
                        const item = values.items[j];
                        if (!isFlow(item) && item.category_id === id)
                            return 'duplicate category';
                    }
                    return null;
                },
                // records & flows amounts
                amount: (value, values, path) => {
                    if (value === null)
                        return 'enter amount';
                    if (value === 0)
                        return 'non-zero amount';
                    const i = parseInt(path.replace(/^\D+/g, ''));
                    let sum = 0;
                    for (let j = 0; j <= i; j++)
                        sum += values.items[j].amount;
                    if (values.amount === null || sum > values.amount)
                        return 'exceeds total';
                    if (i === values.items.length - 1 && sum < values.amount)
                        return 'less than total';
                    return null;
                }
            }
        },
        transformValues: (values: FormValues) => ({
            account_id: values.account_id,
            amount: values.amount,
            is_expense: values.isExpense,
            agent: values.agent,
            comment: values.comment,
            date_issued: DateTime.fromJSDate(values.date).plus(Duration.fromObject({
                hour: DateTime.fromJSDate(values.time).hour,
                minute: DateTime.fromJSDate(values.time).minute
            })).toISO({ includeOffset: false }),
            flows: values.isDirect ?
                [{ amount: values.amount, agent: values.agent }]
                :
                values.items.filter(isFlow)
                    .map(item => ({
                        amount: item.amount,
                        agent: item.agent
                    })),
            records: values.isDirect ?
                [] : values.items.filter(isRecord)
                    .map(item => ({
                        amount: item.amount,
                        category_id: item.category_id
                    }))
        })
    });

    // const submit = useSubmit();
    // TODO: let react router know of the change
    const submitForm = (values: transformedFormValues) =>
        fetch(`/api/transactions/add`, {
            method: 'post',
            body: JSON.stringify(values),
            signal: AbortSignal.timeout(3000)
        }).then(throwOrReturnFromResponse);

    return <form onSubmit={form.onSubmit((vals) => submitForm(vals).then(() => context.closeModal(id)))}>
        <Group grow align='flex-start'>
            <DatePicker
                data-autofocus label="date" placeholder="dd.mm.yyyy" withAsterisk
                inputFormat="DD.MM.YYYY" clearable={false}
                minDate={DateTime.fromISO(account.date_created).toJSDate()}
                maxDate={DateTime.now().toJSDate()}
                allowFreeInput dateParser={(dateString: string) => {
                    return DateTime.fromFormat(dateString, 'dd.MM.yyyy').toJSDate()
                }}
                {...form.getInputProps('date')}
            />
            <TimeInput
                defaultValue={new Date()}
                label="time"
                withAsterisk
                {...form.getInputProps('time')}
            />
        </Group>
        <Input.Wrapper
            label='amount' withAsterisk
        >
            <Grid>
                <Grid.Col span='auto'>
                    <NumberInput
                        precision={currency?.decimals} hideControls
                        min={0}
                        formatter={(value: string) =>
                            !Number.isNaN(parseFloat(value))
                                ? `${currency?.code} ${value}`
                                : `${currency?.code} `
                        }
                        parser={(value: string) => value.replace(/\D+\s/g, '')}
                        {...form.getInputProps('amount')}
                    />
                </Grid.Col>
                <Grid.Col span='content'>
                    <Button.Group>
                        <Button
                            className={cx(classes.incExpButton, form.values.isExpense ? classes.incomeOff : classes.incomeOn)}
                            onClick={() => {
                                if (form.values.isExpense) {
                                    form.values.items
                                        .forEach((item, i) => isRecord(item) ? form.setFieldValue(
                                            `items.${i}.category_id`, null
                                        ) : null)
                                }
                                form.setFieldValue('isExpense', false);
                            }}><IconPlus /></Button>
                        <Button
                            className={cx(classes.incExpButton, form.values.isExpense ? classes.expenseOn : classes.expenseOff)}
                            onClick={() => {
                                if (!form.values.isExpense) {
                                    form.values.items
                                        .forEach((item, i) => isRecord(item) ? form.setFieldValue(
                                            `items.${i}.category_id`, null
                                        ) : null)
                                }
                                form.setFieldValue('isExpense', true);
                            }}><IconMinus /></Button>
                    </Button.Group>
                </Grid.Col>
            </Grid>
        </Input.Wrapper>
        <Autocomplete
            withAsterisk label='agent'
            data={agents.map(
                agent => agent.desc
            )}
            {...form.getInputProps('agent')}
        />
        <Divider my='sm' />
        <Input.Wrapper
            label='add records & flows | direct flow'
            withAsterisk
            {...form.getInputProps('isDirect')}
        >
            <Grid>
                <Grid.Col span='auto'>
                    <Button
                        fullWidth variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                        leftIcon={
                            form.values.isExpense ? <IconTrendingDown /> : <IconTrendingUp />
                        }
                        disabled={form.values.isDirect}
                        onClick={() => {
                            form.clearFieldError('isDirect');
                            const item: Item = {
                                type: 'record',
                                ix: form.values.n_records,
                                amount: null,
                                category_id: null
                            };
                            form.insertListItem('items', item);
                            form.insertListItem('records', item);
                            form.setFieldValue('n_records', form.values.n_records + 1)
                        }}
                    >
                        Add Record
                    </Button>
                </Grid.Col>
                <Grid.Col span='auto'>
                    <Button
                        fullWidth variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                        leftIcon={<IconArrowWaveRightUp />}
                        disabled={form.values.isDirect} color='pink'
                        onClick={() => {
                            form.clearFieldError('isDirect');
                            const item: Item = {
                                type: 'flow',
                                ix: form.values.n_flows,
                                amount: null,
                                agent: ''
                            };
                            form.insertListItem('items', item)
                            form.insertListItem('flows', item)
                            form.setFieldValue('n_flows', form.values.n_flows + 1)
                        }}
                    >
                        Add Flow
                    </Button>
                </Grid.Col>
                <Grid.Col span='content'>
                    <Switch
                        size='lg' color='pink'
                        onLabel={<IconArrowWaveRightUp />}
                        offLabel={<IconArrowWaveRightUp />}
                        checked={form.values.isDirect}
                        onChange={() => form.setFieldValue('isDirect', !form.values.isDirect)}
                    />
                </Grid.Col>
            </Grid>
        </Input.Wrapper>
        {
            !form.values.isDirect && form.values.items.map((data, i) =>
                isFlow(data) ?
                    <Grid key={i}>
                        <Grid.Col span={4}>
                            <NumberInput
                                label={`#${i} flow`} withAsterisk
                                precision={currency?.decimals} hideControls
                                formatter={(value: string) =>
                                    !Number.isNaN(parseFloat(value))
                                        ? `${currency?.code} ${value}`
                                        : `${currency?.code} `
                                }
                                parser={(value: string) => value.replace(/\D+\s/g, '')}
                                {...form.getInputProps(`items.${i}.amount`)}
                            />
                        </Grid.Col>
                        <Grid.Col span={8}>
                            <Input.Wrapper label='agent' withAsterisk>
                                <Grid>
                                    <Grid.Col span='auto'>
                                        <Autocomplete
                                            placeholder={`Agent #${data.ix}`}
                                            data={agents.map(
                                                agent => agent.desc
                                            )}
                                            {...form.getInputProps(`items.${i}.agent`)}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span='content'>
                                        <ActionIcon
                                            color="red" size='lg' variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                                            onClick={() => {
                                                form.values.items.forEach(
                                                    (item, ix) => {
                                                        if (item.type === 'flow' && item.ix > data.ix)
                                                            form.setFieldValue(`items.${ix}.ix`, item.ix - 1)
                                                    }
                                                )
                                                form.removeListItem('items', i);
                                                form.removeListItem('flows', data.ix);
                                                form.setFieldValue('n_flows', form.values.n_flows - 1)
                                            }}>
                                            <IconEraser size={18} />
                                        </ActionIcon>
                                    </Grid.Col>
                                </Grid>
                            </Input.Wrapper>
                        </Grid.Col>
                    </Grid>
                    :
                    <Grid key={i}>
                        <Grid.Col span={4}>
                            <NumberInput
                                label={`#${i} record`} withAsterisk
                                precision={currency?.decimals} hideControls
                                formatter={(value: string) =>
                                    !Number.isNaN(parseFloat(value))
                                        ? `${currency?.code} ${value}`
                                        : `${currency?.code} `
                                }
                                parser={(value: string) => value.replace(/\D+\s/g, '')}
                                {...form.getInputProps(`items.${i}.amount`)}
                            />
                        </Grid.Col>
                        <Grid.Col span={8}>
                            <Input.Wrapper label='category' withAsterisk>
                                <Grid>
                                    <Grid.Col span='auto'>
                                        <Select
                                            searchable clearable
                                            placeholder={`Category #${data.ix}`}
                                            data={categories.filter(
                                                cat => cat.usable && cat.is_expense === form.values.isExpense
                                            ).map(
                                                cat => ({
                                                    value: cat.id,
                                                    label: cat.desc,
                                                    group: cat.parent_id === null ? cat.desc : cat.parent.desc
                                                })
                                            )}
                                            {...form.getInputProps(`items.${i}.category_id`)}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span='content'>
                                        <ActionIcon
                                            color="red" size='lg' variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                                            onClick={() => {
                                                form.values.items.forEach(
                                                    (item, ix) => {
                                                        if (item.type === 'record' && item.ix > data.ix)
                                                            form.setFieldValue(`items.${ix}.ix`, item.ix - 1)
                                                    }
                                                )
                                                form.removeListItem('items', i);
                                                form.removeListItem('records', data.ix);
                                                form.setFieldValue('n_records', form.values.n_records - 1)
                                            }}>
                                            <IconEraser size={18} />
                                        </ActionIcon>
                                    </Grid.Col>
                                </Grid>
                            </Input.Wrapper>
                        </Grid.Col>
                    </Grid>
            )
        }
        <Divider my='sm' />
        <TextInput label='comment' {...form.getInputProps('comment')} />
        <Button fullWidth mt="md" type='submit'>
            add transaction
        </Button>
    </form >

};
