import { NumberInput, NumberInputProps } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { CurrencyQueryResult } from "../../types/Currency";

interface AmountInputProps extends NumberInputProps {
    currency: CurrencyQueryResult | undefined
    onChange: (value: number | '') => void
    value: number | ''
    showPrefix?: boolean
}

export default function AmountInput(props: AmountInputProps) {

    const { currency, value: integral, onChange, showPrefix = true, ...others } = props;

    const [amount, setAmount] = useState<number | ''>('');
    useEffect(() => {
        integral === '' || currency?.decimals === undefined ?
            setAmount('')
        :
            setAmount(integral / (10 ** currency?.decimals))
    }, [integral, currency?.decimals])

    useEffect(() => (currency === undefined || integral === '') ?
        onChange('') : onChange(integral)
        // eslint-disable-next-line
        , [currency])

    const formatter = useCallback((v: string) =>
        !currency ? v :
            !Number.isNaN(parseFloat(v))
                ? (showPrefix ? `${currency.code} ${v}` : v)
                : ''
        , [currency, showPrefix])

    return <NumberInput
        precision={currency?.decimals} hideControls
        min={0} step={0.1} // such that mobile has a . on keyboards

        formatter={formatter}
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