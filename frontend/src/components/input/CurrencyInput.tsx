import { Select, SelectProps } from "@mantine/core";
import useIsPhone from "../../hooks/useIsPhone";
import Placeholder from "../Placeholder";
import { useEffect } from "react";
import { useCurrencies } from "../../types/Currency";

interface CurrencyInputProps extends Omit<SelectProps, 'data'> {
    hasDefault?: boolean
}

const CurrencyInput = ({ hasDefault = true, onChange, value, ...props }: CurrencyInputProps) => {
    const isPhone = useIsPhone();
    const query = useCurrencies();

    useEffect(() => {
        hasDefault && !value && onChange &&
            onChange(query.data?.at(0)?.id.toString() ?? null)
    }, [hasDefault, onChange, value, query.data]);

    if (!query.isSuccess)
        return <Placeholder queries={[query]} height={30} />

    const currencies = query.data;

    return <Select
        placeholder="select currency"
        searchable={!isPhone}
        data={currencies.map(
            cur => ({
                value: cur.id.toString(),
                label: cur.code,
            })
        )}
        onChange={onChange}
        value={value}
        {...props}
    />
}

export default CurrencyInput;