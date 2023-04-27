import { CurrencyQueryResult } from "../types/Currency";

export default function useAmount(int: number | undefined, currency: CurrencyQueryResult | undefined) {
    if (int === undefined || currency === undefined)
        return '';
    
    return `${currency.code} ${int / (10 ** currency.decimals)}`;
}