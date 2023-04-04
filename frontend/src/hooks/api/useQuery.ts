import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
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
    useQuery<UserFlat, Response>({ queryKey: ["me"] });

export const useAccounts = () =>
    useQuery<AccountDeep[], Response>({ queryKey: ["accounts"] });

export const useAccount = (account_id: number) =>
    useQuery<AccountDeep, Response>({
        queryKey: ["accounts", account_id],
        queryFn: () => get(`/api/accounts/${account_id}`)
    });

export const useAgents = () =>
    useQuery<AgentFlat[], Response>({ queryKey: ["agents"] });

export const useCategories = () =>
    useQuery<CategoryFlat[], Response>({ queryKey: ["categories"] });

export const useCurrencies = () =>
    useQuery<CurrencyFlat[], Response>({ queryKey: ["currencies"] });

interface useChangesProps {
    start?: DateTime
    end?: DateTime
    n?: number
}

const changesSearchParams = ({ start, end, n }: useChangesProps) => {
    let searchParams = new URLSearchParams();
    if (start !== undefined) {
        const naiveStart = start.toISO({ includeOffset: false });
        searchParams.append('start', naiveStart);
    }
    if (end !== undefined) {
        const naiveEnd = end.toISO({ includeOffset: false });
        searchParams.append('end', naiveEnd);
    }
    if (n !== undefined)
        searchParams.append('n', n.toString());
    return searchParams.toString();
}

export const useChanges = (id: number, props: useChangesProps) =>
    useQuery<AccountChange[], Response>({
        queryKey: ["changes", id, props],
        queryFn: () => get(`/api/accounts/${id}/changes?${changesSearchParams(props)}`)
    });

