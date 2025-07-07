import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export interface CurrencyFormValues {
    code: string
    decimals: number
}

export interface CurrencyQueryResult extends CurrencyFormValues {
    id: number,
    type: 'currency'
}
export interface InitialCurrencyFormValues {
    codes: string[]
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

export const useAddCurrency = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: CurrencyFormValues) =>
            axios.post('/api/currencies/add', values),
        onSuccess: () => queryClient.invalidateQueries(["currencies"])
    });
}

export const useDeleteCurrency = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () =>
            axios.delete(`/api/currencies/${id}/delete`),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['currencies', id] })
            queryClient.invalidateQueries();
        }
    });
}

export const INTERNATIONAL_CURRENCIES: CurrencyFormValues[] = [
    {code: "AED", decimals: 2},
    {code: "ALL", decimals: 2},
    {code: "AMD", decimals: 2},
    {code: "AOA", decimals: 2},
    {code: "ARS", decimals: 2},
    {code: "AUD", decimals: 2},
    {code: "AWG", decimals: 2},
    {code: "AZN", decimals: 2},
    {code: "BAM", decimals: 2},
    {code: "BBD", decimals: 2},
    {code: "BDT", decimals: 2},
    {code: "BGN", decimals: 2},
    {code: "BHD", decimals: 3},
    {code: "BMD", decimals: 2},
    {code: "BND", decimals: 2},
    {code: "BOB", decimals: 2},
    {code: "BRL", decimals: 2},
    {code: "BSD", decimals: 2},
    {code: "BWP", decimals: 2},
    {code: "BYN", decimals: 2},
    {code: "BZD", decimals: 2},
    {code: "CAD", decimals: 2},
    {code: "CHF", decimals: 2},
    {code: "CLP", decimals: 2},
    {code: "CNH", decimals: 2},
    {code: "CNY", decimals: 2},
    {code: "COP", decimals: 2},
    {code: "CRC", decimals: 2},
    {code: "CUP", decimals: 2},
    {code: "CVE", decimals: 0},
    {code: "CZK", decimals: 2},
    {code: "DJF", decimals: 0},
    {code: "DKK", decimals: 2},
    {code: "DOP", decimals: 2},
    {code: "DZD", decimals: 2},
    {code: "EGP", decimals: 2},
    {code: "ETB", decimals: 2},
    {code: "EUR", decimals: 2},
    {code: "FJD", decimals: 2},
    {code: "FKP", decimals: 2},
    {code: "GBP", decimals: 2},
    {code: "GEL", decimals: 2},
    {code: "GHS", decimals: 2},
    {code: "GIP", decimals: 2},
    {code: "GMD", decimals: 2},
    {code: "GNF", decimals: 0},
    {code: "GTQ", decimals: 2},
    {code: "GYD", decimals: 2},
    {code: "HKD", decimals: 2},
    {code: "HNL", decimals: 2},
    {code: "HTG", decimals: 2},
    {code: "HUF", decimals: 2},
    {code: "IDR", decimals: 0},
    {code: "ILS", decimals: 2},
    {code: "INR", decimals: 2},
    {code: "IQD", decimals: 3},
    {code: "ISK", decimals: 2},
    {code: "JMD", decimals: 2},
    {code: "JOD", decimals: 3},
    {code: "JPY", decimals: 0},
    {code: "KES", decimals: 2},
    {code: "KGS", decimals: 2},
    {code: "KHR", decimals: 2},
    {code: "KMF", decimals: 0},
    {code: "KRW", decimals: 0},
    {code: "KWD", decimals: 3},
    {code: "KYD", decimals: 2},
    {code: "KZT", decimals: 2},
    {code: "LAK", decimals: 2},
    {code: "LBP", decimals: 2},
    {code: "LKR", decimals: 2},
    {code: "LYD", decimals: 3},
    {code: "MAD", decimals: 2},
    {code: "MDL", decimals: 2},
    {code: "MKD", decimals: 2},
    {code: "MMK", decimals: 2},
    {code: "MNT", decimals: 2},
    {code: "MOP", decimals: 2},
    {code: "MRU", decimals: 2},
    {code: "MUR", decimals: 2},
    {code: "MVR", decimals: 2},
    {code: "MWK", decimals: 2},
    {code: "MXN", decimals: 2},
    {code: "MYR", decimals: 2},
    {code: "MZN", decimals: 2},
    {code: "NAD", decimals: 2},
    {code: "NGN", decimals: 2},
    {code: "NIO", decimals: 2},
    {code: "NOK", decimals: 2},
    {code: "NPR", decimals: 2},
    {code: "NZD", decimals: 2},
    {code: "OMR", decimals: 3},
    {code: "PAB", decimals: 2},
    {code: "PEN", decimals: 2},
    {code: "PGK", decimals: 2},
    {code: "PHP", decimals: 2},
    {code: "PKR", decimals: 2},
    {code: "PLN", decimals: 2},
    {code: "PYG", decimals: 0},
    {code: "QAR", decimals: 2},
    {code: "RON", decimals: 2},
    {code: "RSD", decimals: 2},
    {code: "RUB", decimals: 2},
    {code: "RWF", decimals: 0},
    {code: "SAR", decimals: 2},
    {code: "SBD", decimals: 2},
    {code: "SCR", decimals: 2},
    {code: "SEK", decimals: 2},
    {code: "SGD", decimals: 2},
    {code: "SHP", decimals: 2},
    {code: "SLE", decimals: 2},
    {code: "SOS", decimals: 2},
    {code: "SRD", decimals: 2},
    {code: "STN", decimals: 2},
    {code: "SVC", decimals: 2},
    {code: "SZL", decimals: 2},
    {code: "THB", decimals: 2},
    {code: "TND", decimals: 3},
    {code: "TOP", decimals: 2},
    {code: "TRY", decimals: 2},
    {code: "TTD", decimals: 2},
    {code: "TWD", decimals: 2},
    {code: "TZS", decimals: 2},
    {code: "UAH", decimals: 2},
    {code: "UGX", decimals: 0},
    {code: "USD", decimals: 2},
    {code: "UYU", decimals: 2},
    {code: "UZS", decimals: 2},
    {code: "VEF", decimals: 2},
    {code: "VND", decimals: 0},
    {code: "VUV", decimals: 0},
    {code: "WST", decimals: 2},
    {code: "XAF", decimals: 0},
    {code: "XCG", decimals: 2},
    {code: "XCD", decimals: 2},
    {code: "XOF", decimals: 0},
    {code: "XPF", decimals: 0},
    {code: "YER", decimals: 2},
    {code: "ZAR", decimals: 2},
    {code: "ZMW", decimals: 2}
]