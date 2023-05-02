import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

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

interface CurrencyDepsQueryResult {
    accounts: number
    transactions: number
}

export const useCurrencyDependencies = (currency_id: number) =>
    useQuery<CurrencyDepsQueryResult, AxiosError>({ queryKey: ["currencies", currency_id, "dependencies"] });

export const useDeleteCurrency = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () =>
            axios.delete(`/api/currencies/${id}/delete`),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['currencies', id]})
            queryClient.invalidateQueries();
        }
    });
}