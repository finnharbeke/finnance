import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export interface CurrencyQueryResult {
    id: number,
    code: string,
    decimals: number,
    type: 'currency'
}

export interface CurrencyDeepQueryResult extends CurrencyQueryResult {
    
}

export const useCurrencies = () =>
    useQuery<CurrencyQueryResult[], AxiosError>({ queryKey: ["currencies"] });

export const useCurrency = (currency_id: string | number) =>
    useQuery<CurrencyQueryResult, AxiosError>({ queryKey: ["currencies", currency_id.toString()] });