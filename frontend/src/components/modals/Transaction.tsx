import { ActionIcon, Autocomplete, Button, createStyles, Divider, Grid, Group, Input, LoadingOverlay, MantineTheme, NumberInput, SegmentedControl, Select, Switch, Text, TextInput, useMantineTheme } from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { useListState, useToggle } from "@mantine/hooks";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { OpenContextModal } from "@mantine/modals/lib/context";
import { IconArrowWaveRightUp, IconEraser, IconExchange, IconMinus, IconPlus, IconTrendingDown, IconTrendingUp } from "@tabler/icons";
import * as moment from "moment";
import { useState } from "react";
import { ErrorHandlerContext, throwOrReturnFromResponse } from "../../contexts/ErrorHandlerProvider";
import useErrorHandler from "../../hooks/useErrorHandler";
import { AgentFlat } from "../../Types/Agent";
import { CategoryFlat } from "../../Types/Category";
import { CurrencyFlat } from "../../Types/Currency";

type OpenTransactionModalProps = {
    currency?: CurrencyFlat,
}

type TransactionModalProps = {
    currency?: CurrencyFlat,
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

interface Item {
    type: 'flow' | 'record',
    ix: number
}

interface Record {
    amount: number,
    category: number,
}
interface Flow {
    amount: number,
    agent: string,
}

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
    const { currency, agents, categories } = innerProps;

    const [isExpense, toggleExpense] = useToggle([true, false]);
    const [isDirect, toggleDirect] = useToggle();
    const [items, itemsHandlers] = useListState<Item>([]);
    const [records, recordsHandlers] = useListState<Record>([]);
    const [flows, flowsHandlers] = useListState<Flow>([]);

    return <form>
        <Group grow>
            <DatePicker
                data-autofocus label="date" placeholder="dd.mm.yyyy" withAsterisk
                inputFormat="DD.MM.YYYY" clearable={false}
                allowFreeInput dateParser={(dateString: string) => {
                    return moment(dateString, 'DD.MM.YYYY').toDate()
                }}
            />
            <TimeInput
                defaultValue={new Date()}
                label="time"
                withAsterisk
            />
        </Group>
        <Grid align='flex-end'>
            <Grid.Col span='auto'>
                <NumberInput
                    label='amount' withAsterisk
                    precision={currency?.decimals} hideControls
                    formatter={(value: string) =>
                        !Number.isNaN(parseFloat(value))
                            ? `${currency?.code} ${value}`
                            : `${currency?.code} `
                    }
                    parser={(value: string) => value.replace(/\D+\s/g, '')}
                />
            </Grid.Col>
            <Grid.Col span='content'>
                <Button.Group>
                    <Button
                        className={cx(classes.incExpButton, isExpense ? classes.incomeOff : classes.incomeOn)}
                        onClick={() => toggleExpense(false)}><IconPlus /></Button>
                    <Button
                        className={cx(classes.incExpButton, isExpense ? classes.expenseOn : classes.expenseOff)}
                        onClick={() => toggleExpense(true)}><IconMinus /></Button>
                </Button.Group>
            </Grid.Col>
        </Grid>
        <Autocomplete withAsterisk label='agent' data={agents.map(
            agent => agent.desc
        )} />
        <Divider my='sm' />
        <Input.Wrapper
            label='add records & flows | direct flow'
            withAsterisk
        >
            <Grid>
                <Grid.Col span='auto'>
                    <Button
                        fullWidth variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                        leftIcon={
                            isExpense ? <IconTrendingDown /> : <IconTrendingUp />
                        }
                        disabled={isDirect}
                        onClick={() => {
                            itemsHandlers.append({
                                type: 'record',
                                ix: records.length,
                            });
                            recordsHandlers.append({
                                amount: 0,
                                category: null
                            });
                        }}
                    >
                        Add Record
                    </Button>
                </Grid.Col>
                <Grid.Col span='auto'>
                    <Button
                        fullWidth variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                        leftIcon={<IconArrowWaveRightUp />}
                        disabled={isDirect} color='pink'
                        onClick={() => {
                            itemsHandlers.append({
                                type: 'flow',
                                ix: flows.length,
                            });
                            flowsHandlers.append({
                                amount: 0,
                                agent: ''
                            });
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
                        checked={isDirect}
                        onChange={() => toggleDirect()}
                    />
                </Grid.Col>
            </Grid>
        </Input.Wrapper>
        {!isDirect && items.map((data, i) =>
            data.type === 'flow' ?
                <Grid key={i} align='flex-end'>
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
                            onChange={(value: number) =>
                                flowsHandlers.setItemProp(data.ix, 'amount', value)
                            }
                            value={flows[data.ix].amount === 0 ? undefined : flows[data.ix].amount}
                        />
                    </Grid.Col>
                    <Grid.Col span='auto'>
                        <Autocomplete withAsterisk label='agent'
                            placeholder={`Agent #${data.ix}`}
                            data={agents.map(
                                agent => agent.desc
                            )} onChange={(value: string) =>
                                flowsHandlers.setItemProp(data.ix, 'agent', value)
                            } value={flows[data.ix].agent} />
                    </Grid.Col>
                    <Grid.Col span='content'>
                        <ActionIcon
                            color="red" size='lg' variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                            onClick={() => {
                                flowsHandlers.remove(data.ix);
                                itemsHandlers.remove(i);
                                itemsHandlers.applyWhere(
                                    fl => fl.type === 'flow' && fl.ix > data.ix,
                                    item => ({ type: 'flow', ix: item.ix - 1 })
                                )
                            }}>
                            <IconEraser size={18} />
                        </ActionIcon>
                    </Grid.Col>
                </Grid>
                :
                <Grid key={i} align='flex-end'>
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
                            onChange={(value: number) =>
                                recordsHandlers.setItemProp(data.ix, 'amount', value)
                            }
                            value={records[data.ix].amount === 0 ? undefined : records[data.ix].amount}
                        />
                    </Grid.Col>
                    <Grid.Col span='auto'>
                        <Select withAsterisk
                            label='category' searchable clearable
                            placeholder={`Category #${data.ix}`}
                            data={categories.filter(
                                cat => cat.is_expense === isExpense
                            ).map(
                                cat => ({
                                    value: cat.id,
                                    label: cat.desc,
                                })
                            )}
                            onChange={(value: number) =>
                                recordsHandlers.setItemProp(data.ix, 'category', value)
                            } value={records[data.ix].category}
                        />
                    </Grid.Col>
                    <Grid.Col span='content'>
                        <ActionIcon
                            color="red" size='lg' variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
                            onClick={() => {
                                recordsHandlers.remove(data.ix);
                                itemsHandlers.remove(i);
                                itemsHandlers.applyWhere(
                                    rec => rec.type === 'record' && rec.ix > data.ix,
                                    item => ({ type: 'record', ix: item.ix - 1 })
                                )
                            }}>
                            <IconEraser size={18} />
                        </ActionIcon>
                    </Grid.Col>
                </Grid>
        )}
        <Divider my='sm' />
        <TextInput label='comment' />
        <Button variant='light' fullWidth mt="md" onClick={() => context.closeModal(id)}>
            Close modal
        </Button>
    </form>

};
