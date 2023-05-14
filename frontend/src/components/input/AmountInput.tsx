import { NumberInput, NumberInputProps } from "@mantine/core";
import { useEffect, useState } from "react";
import { CurrencyQueryResult } from "../../types/Currency";

interface AmountInputProps extends NumberInputProps {
    currency: CurrencyQueryResult | undefined
    onChange: (value: number | '') => void
    value: number | ''
    showPrefix?: boolean
}

export default function AmountInput(props: AmountInputProps) {

    const { currency, value: integral, onChange, showPrefix = true, ...others } = props;

    const [amount, setAmount] = useState<number | ''>('');
    useEffect(() => {
        integral === '' ?
            setAmount('')
            :
            currency?.decimals === undefined ?
                setAmount(integral)
                :
                setAmount(integral / (10 ** currency?.decimals))
    }, [integral, currency])

    return <NumberInput
        precision={currency?.decimals} hideControls
        min={0} step={0.1} // such that mobile has a . on keyboards

        formatter={s => ((showPrefix && currency?.code && s && currency?.code + ' ') || '') + s}
        parser={(value: string) => value.replace(/\D+\s/g, '').replace(',', '.')}

        value={amount}
        onChange={(newVal) =>
            onChange(newVal === '' ? newVal :
                currency !== undefined ?
                    Math.round(newVal * (10 ** currency.decimals))
                    :
                    newVal
            )
        }
        {...others}
    />
}