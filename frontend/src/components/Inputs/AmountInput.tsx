import { NumberInput, NumberInputProps } from "@mantine/core";
import { CurrencyFlat } from "../../Types/Currency";

interface AmountInputProps extends NumberInputProps {
    currency?: CurrencyFlat
}

export default function AmountInput({currency, ...others} : AmountInputProps) {
    return <NumberInput
        precision={currency?.decimals} hideControls
        min={0}
        formatter={(value: string) =>
            !currency ? value :
            !Number.isNaN(parseFloat(value))
                ? `${currency?.code} ${value}`
                : `${currency?.code} `
        }
        step={0.01}
        parser={(value: string) => value.replace(/\D+\s/g, '')}
        {...others}
    />
}