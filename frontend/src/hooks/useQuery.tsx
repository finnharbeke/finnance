import { showNotification } from '@mantine/notifications';
import { DateTime } from 'luxon';
import { useQuery } from '@tanstack/react-query';
import { AccountDeep } from '../Types/Account';
import { AccountChange } from '../Types/AccountChange';
import { AgentFlat } from '../Types/Agent';
import { CategoryFlat } from '../Types/Category';
import { CurrencyFlat } from '../Types/Currency';
import { UserFlat } from "../Types/User";

const handleResponse = (r: Response) => r.json().then(data => {
    if (r.ok)
        return data
    else
        if (r.status !== 404)
            showNotification({
                title: `${r.status} ${r.statusText}`,
                message: data.msg,
                color: 'red',
                autoClose: false
            })
    throw new Response(data.msg, { status: r.status, statusText: r.statusText })
})

export const useCurrentUser = () =>
    useQuery<UserFlat, Response>({
        queryKey: ["me"],
        queryFn: () =>
            fetch("/api/me").then(handleResponse),
    });

export const useAccounts = () =>
    useQuery<AccountDeep[], Response>({
        queryKey: ["accounts"],
        queryFn: () =>
            fetch("/api/accounts").then(handleResponse),
    });

export const useAccount = (account_id: number) =>
    useQuery<AccountDeep, Response>({
        queryKey: ["accounts", account_id],
        queryFn: () =>
            fetch(`/api/accounts/${account_id}`).then(handleResponse),
    });

export const useAgents = () =>
    useQuery<AgentFlat[], Response>({
        queryKey: ["agents"],
        queryFn: () =>
            fetch("/api/agents").then(handleResponse),
    });

export const useCategories = () =>
    useQuery<CategoryFlat[], Response>({
        queryKey: ["categories"],
        queryFn: () =>
            fetch("/api/categories").then(handleResponse),
    });

export const useCurrencies = () =>
    useQuery<CurrencyFlat[], Response>({
        queryKey: ["currencies"],
        queryFn: () =>
            fetch("/api/currencies").then(handleResponse),
    });

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
        queryKey: ["changes"],
        queryFn: () => fetch(`/api/accounts/${id}/changes?${changesSearchParams(props)}`).then(handleResponse)
    });

