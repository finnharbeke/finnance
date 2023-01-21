import { Autocomplete, Button, createStyles, Grid, Group, LoadingOverlay, MantineTheme, NumberInput, TextInput } from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { useToggle } from "@mantine/hooks";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { OpenContextModal } from "@mantine/modals/lib/context";
import { IconMinus, IconPlus } from "@tabler/icons";
import * as moment from "moment";
import { useState } from "react";
import { throwOrReturnFromResponse } from "../../contexts/ErrorHandlerProvider";
import useErrorHandler from "../../hooks/useErrorHandler";
import { AgentFlat } from "../../Types/Agent";
import { CurrencyFlat } from "../../Types/Currency";

type OpenTransactionModalProps = {
    currency?: CurrencyFlat,
}

type TransactionModalProps = {
    currency?: CurrencyFlat,
    agents: AgentFlat[]
}

export const openTransactionModal = async (props?: OpenContextModal<OpenTransactionModalProps>) => {
    fetch('/api/agents', {
        signal: AbortSignal.timeout(3000)
    }).then(throwOrReturnFromResponse)
        .then((data: AgentFlat[]) => {
            console.log(data);
            return openContextModal({
                ...{
                    modal: 'transaction',
                    title: 'new transaction',
                },
                ...props,
                innerProps: {
                    ...{
                        agents: data
                    },
                    ...props.innerProps
                }
            })
        }
        )// .catch(handleErrors)
        // TODO catch this!

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
    const { classes, cx } = useStyles();
    const { currency, agents } = innerProps;

    const [isExpense, toggleExpense] = useToggle([true, false]);

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
        <Button variant='light' fullWidth mt="md" onClick={() => context.closeModal(id)}>
            Close modal
        </Button>
    </form>

};
