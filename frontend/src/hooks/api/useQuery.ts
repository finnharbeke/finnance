import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { DateTime } from 'luxon';
import { AccountDeep } from '../../Types/Account';
import { AccountChange } from '../../Types/AccountChange';
import { AgentFlat } from '../../Types/Agent';
import { CategoryFlat } from '../../Types/Category';
import { CurrencyFlat } from '../../Types/Currency';
import { UserFlat } from "../../Types/User";

export const get = async (url: string) => {
    const { data } = await axios.get(url);
    return data;
}

export const useCurrentUser = () =>
    useQuery<UserFlat, AxiosError>({ queryKey: ["auth", "me"] });

export const useAccounts = () =>
    useQuery<AccountDeep[], AxiosError>({ queryKey: ["accounts"] });

export const useAccount = (account_id: number) =>
    useQuery<AccountDeep, AxiosError>({
        queryKey: ["accounts", account_id],
        queryFn: () => get(`/api/accounts/${account_id}`)
    });

export const useAgents = () =>
    useQuery<AgentFlat[], AxiosError>({ queryKey: ["agents"] });

export const useCategories = () =>
    useQuery<CategoryFlat[], AxiosError>({ queryKey: ["categories"] });

export const useCurrencies = () =>
    useQuery<CurrencyFlat[], AxiosError>({ queryKey: ["currencies"] });

interface useChangesProps {
    start?: DateTime
    end?: DateTime
    search?: string
    pagesize: number
    page: number
}

const changesSearchParams = ({ start, end, search, pagesize, page }: useChangesProps) => {
    let searchParams = new URLSearchParams();
    if (start !== undefined) {
        const naiveStart = start.toISO({ includeOffset: false });
        searchParams.append('start', naiveStart);
    }
    if (end !== undefined) {
        const naiveEnd = end.toISO({ includeOffset: false });
        searchParams.append('end', naiveEnd);
    }
    if (search !== undefined && search.length > 0) {
        searchParams.append('search', search);
    }
    searchParams.append('pagesize', pagesize.toString());
    searchParams.append('page', page.toString());
    return searchParams.toString();
}

interface useChangeReturn {
    changes: AccountChange[]
    pages: number
}

export const useChanges = (id: number, props: useChangesProps) =>
    useQuery<useChangeReturn, AxiosError>({
        queryKey: ["changes", id, props],
        queryFn: () => get(`/api/accounts/${id}/changes?${changesSearchParams(props)}`)
    });

