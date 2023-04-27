import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { DateTime } from 'luxon';
import { AccountDeepQueryResult, Change } from '../../types/Account';
import { AgentQueryResult } from '../../types/Agent';
import { CurrencyQueryResult } from '../../types/Currency';
import { UserQueryResult } from "../../types/User";

export const get = async (url: string) => {
    const { data } = await axios.get(url);
    return data;
}

export const useCurrentUser = () =>
    useQuery<UserQueryResult, AxiosError>({ queryKey: ["auth", "me"] });

export const useAccounts = () =>
    useQuery<AccountDeepQueryResult[], AxiosError>({ queryKey: ["accounts"] });

export const useAccount = (account_id: number) =>
    useQuery<AccountDeepQueryResult, AxiosError>({ queryKey: ["accounts", account_id] });

export const useAgents = () =>
    useQuery<AgentQueryResult[], AxiosError>({ queryKey: ["agents"] });

export const useAgent = (agent_id: number) =>
    useQuery<AgentQueryResult, AxiosError>({ queryKey: ["agents", agent_id] });

export const useCurrencies = () =>
    useQuery<CurrencyQueryResult[], AxiosError>({ queryKey: ["currencies"] });

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
    changes: Change[]
    pages: number
}

export const useChanges = (id: number, props: useChangesProps) =>
    useQuery<useChangeReturn, AxiosError>({
        queryKey: ["changes", id, props],
        queryFn: () => get(`/api/accounts/${id}/changes?${changesSearchParams(props)}`)
    });

