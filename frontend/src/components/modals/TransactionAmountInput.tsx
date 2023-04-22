import { Button, createStyles, Grid, Input, MantineTheme } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { TbMinus, TbPlus } from "react-icons/tb";
import { CurrencyFlat } from "../../Types/Currency";
import AmountInput from "../AmountInput";
import { FormValues, isRecord, transformedFormValues } from "./TransactionModal";

interface TransactionAmountInputProps {
    form: UseFormReturnType<FormValues, (vals: FormValues) => transformedFormValues>
    currency?: CurrencyFlat
}

export default function TransactionAmountInput({ form, currency }: TransactionAmountInputProps) {
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

    return <Input.Wrapper
        label='amount' withAsterisk
    >
        <Grid>
            <Grid.Col span='auto'>
                <AmountInput
                    currency={currency}
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
                        }}
                    ><TbPlus size={28} /></Button>
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
                        }}
                    ><TbMinus size={28} /></Button>
                </Button.Group>
            </Grid.Col>
        </Grid>
    </Input.Wrapper>
}