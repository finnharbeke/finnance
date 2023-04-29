import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Change } from '../../types/Account';
import { CurrencyQueryResult } from '../../types/Currency';
import { UserQueryResult } from "../../types/User";

export const getAxiosData = async (url: string) => {
    const { data } = await axios.get(url);
    return data;
}

export const useCurrentUser = () =>
    useQuery<UserQueryResult, AxiosError>({ queryKey: ["auth", "me"] });

export const useCurrencies = () =>
    useQuery<CurrencyQueryResult[], AxiosError>({ queryKey: ["currencies"] });

export const useCurrency = (currency_id: string | number) =>
    useQuery<CurrencyQueryResult, AxiosError>({ queryKey: ["currencies", currency_id.toString()] });

export interface searchParamsProps {
    [key: string]: string | number | boolean | undefined
}

export const searchParams = (props: searchParamsProps) => {
    const searchParams = new URLSearchParams();
    Object.entries(props).forEach(([key, value]) => {
        if (value !== undefined)
            searchParams.append(key, value.toString())
    })
    return searchParams.toString();
}

interface useChangesProps extends searchParamsProps {
    start?: string
    end?: string
    search?: string
    pagesize: number
    page: number
}

interface useChangeReturn {
    changes: Change[]
    pages: number
}

export const useChanges = (id: number, props: useChangesProps) =>
    useQuery<useChangeReturn, AxiosError>({
        queryKey: ["changes", id, props],
        queryFn: () => getAxiosData(`/api/accounts/${id}/changes?${searchParams(props)}`)
    });

