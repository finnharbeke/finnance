import { CurrencyFlat } from "../Types/Currency";

export default function useAmount(int: number | undefined, currency: CurrencyFlat | undefined) {
    if (int === undefined || currency === undefined)
        return '';
    
    return `${currency.code} ${int / (10 ** currency.decimals)}`;
}