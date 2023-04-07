import { CurrencyFlat } from "../Types/Currency";
    
export const amountToInteger = (amount: number, currency: CurrencyFlat) => {
    return Math.round(amount * (10 ** currency.decimals));
}

export const integerToAmount = (amount: number, currency: CurrencyFlat) => {
    return amount / (10 ** currency.decimals);
}
export const integerToFixed = (amount: number, currency: CurrencyFlat) => {
    return integerToAmount(amount, currency).toFixed(currency.decimals);
}