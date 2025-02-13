import { Button, Grid, Input } from "@mantine/core";
import { TbMinus, TbPlus } from "react-icons/tb";
import { CurrencyQueryResult } from "../../types/Currency";
import { isRecord } from "../../types/Record";
import { TransactionFormType } from "../../types/Transaction";
import AmountInput from "../input/AmountInput";

import classes from "../../styles/TransactionAmountInput.module.css";

interface TransactionAmountInputProps {
    form: TransactionFormType
    currency?: CurrencyQueryResult
}

export default function TransactionAmountInput({ form, currency }: TransactionAmountInputProps) {
    return <Input.Wrapper
        label='amount'
        withAsterisk
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
                        className={[classes.incExpButton, form.values.is_expense ? classes.incomeOff : classes.incomeOn].join(' ')}
                        onClick={() => {
                            if (form.values.is_expense) {
                                form.values.items
                                    .forEach((item, i) => isRecord(item) ? form.setFieldValue(
                                        `items.${i}.category_id`, null
                                    ) : null)
                            }
                            form.setFieldValue('is_expense', false);
                        }}
                    ><TbPlus size={28} /></Button>
                    <Button
                        className={[classes.incExpButton, form.values.is_expense ? classes.expenseOn : classes.expenseOff].join(' ')}
                        onClick={() => {
                            if (!form.values.is_expense) {
                                form.values.items
                                    .forEach((item, i) => isRecord(item) ? form.setFieldValue(
                                        `items.${i}.category_id`, null
                                    ) : null)
                            }
                            form.setFieldValue('is_expense', true);
                        }}
                    ><TbMinus size={28} /></Button>
                </Button.Group>
            </Grid.Col>
        </Grid>
    </Input.Wrapper>
}