import { Select, SelectProps } from "@mantine/core";
import useIsPhone from "../../hooks/useIsPhone";
import { useCurrencies } from "../../hooks/api/useQuery";
import Placeholder from "../Placeholder";

const CurrencyInput = (props: Omit<SelectProps, 'data'>) => {
    const isPhone = useIsPhone();
    const query = useCurrencies();
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
        {...props}
    />
}

export default CurrencyInput;