import { Select, SelectProps } from "@mantine/core";
import useIsPhone from "../../hooks/useIsPhone";
import Placeholder from "../Placeholder";
import { useEffect } from "react";
import { useCurrencies } from "../../types/Currency";
import { useDisclosure } from "@mantine/hooks";

interface CurrencyInputProps extends Omit<SelectProps, 'data'> {
    hasDefault?: boolean
}

const CurrencyInput = ({ hasDefault = true, onChange, value, ...props }: CurrencyInputProps) => {
    const isPhone = useIsPhone();
    const query = useCurrencies();
    // flag so that it only puts default val at start
    const [setAlready, { open: setDefault }] = useDisclosure(false);

    useEffect(() => {
        console.log(hasDefault, setAlready, value, query.data?.at(0))
        if (hasDefault && !setAlready && !value && onChange && query.data) {
            onChange(query.data?.at(0)?.id.toString() ?? null);
            setDefault();
        }
    // eslint-disable-next-line
    }, [hasDefault, onChange, query.data, setAlready, setDefault]);

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