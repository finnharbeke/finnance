import { NumberInput, NumberInputProps } from "@mantine/core";
import { useEffect } from "react";
import { CurrencyQueryResult } from "../../types/Currency";

function useAmount(int: number | '', decimals: number | undefined) {
    if (int === '' || decimals === undefined)
        return int;
    return int / (10 ** decimals);
}

interface AmountInputProps extends NumberInputProps {
    currency: CurrencyQueryResult | undefined
    onChange: (value: number | '') => void
    value: number | ''
}

export default function AmountInput(props: AmountInputProps) {

    const { currency, value: integral, onChange, ...others } = props;

    const amount = useAmount(integral, currency?.decimals);

    useEffect(() => (currency === undefined || integral === '') ?
        onChange('') : onChange(integral)
        // eslint-disable-next-line
        , [currency])

    return <NumberInput
        precision={currency?.decimals} hideControls
        min={0} step={0.1} // such that mobile has a . on keyboards

        formatter={(value: string) =>
            !currency ? value :
                !Number.isNaN(parseFloat(value))
                    ? `${currency?.code} ${value}`
                    : ''
        }
        parser={(value: string) => value.replace(/\D+\s/g, '')}

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