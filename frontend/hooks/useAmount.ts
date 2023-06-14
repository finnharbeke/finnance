import { useEffect, useState } from "react";
import { CurrencyQueryResult } from "../types/Currency";

export default function useAmount(int: number | undefined, currency: CurrencyQueryResult | undefined, prefix: boolean = true) {

    const build = () => {
        if (int === undefined || currency === undefined)
            return '';
    
        const amount = (int / (10 ** currency.decimals)).toFixed(currency.decimals);
        return prefix ? `${currency.code} ${amount}` : amount;
    }
    const [result, setResult] = useState(build());
    // eslint-disable-next-line
    useEffect(() => setResult(build()), [int, currency, prefix]);
    return result;

}