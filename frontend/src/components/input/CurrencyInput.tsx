import { Select, SelectProps } from "@mantine/core";
import useIsPhone from "../../hooks/useIsPhone";
import { useCurrencies } from "../../hooks/api/useQuery";
import Placeholder from "../Placeholder";
import { useEffect } from "react";

interface CurrencyInputProps extends Omit<SelectProps, 'data'> {
    hasDefault?: boolean
}

const CurrencyInput = ({ hasDefault = true, onChange, ...props}:CurrencyInputProps) => {
    const isPhone = useIsPhone();
    const query = useCurrencies();

    useEffect(() => {
        hasDefault && onChange && onChange(query.data?.at(0)?.id.toString() ?? null)
        // eslint-disable-next-line 
    }, [hasDefault, query.data]);

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
        {...props}
    />
}

export default CurrencyInput;