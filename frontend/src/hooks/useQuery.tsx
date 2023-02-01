import { showNotification } from '@mantine/notifications';
import { DateTime } from 'luxon';
import { useQuery } from 'react-query';
import { AccountDeep } from '../Types/Account';
import { AccountChange } from '../Types/AccountChange';
import { AgentFlat } from '../Types/Agent';
import { CategoryFlat } from '../Types/Category';
import { UserDeep } from "../Types/User";

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
    useQuery<UserDeep, Response>("me", () =>
        fetch("/api/me").then(handleResponse),
        { retry: false }
    );

export const useAccount = (account_id: number) =>
    useQuery<AccountDeep, Response>(["account", account_id], () =>
        fetch(`/api/accounts/${account_id}`).then(handleResponse),
        { retry: false }
    );

export const useAgents = () =>
    useQuery<AgentFlat[], Response>("agents", () =>
        fetch("/api/agents").then(handleResponse),
        { retry: false }
    );

export const useCategories = () =>
    useQuery<CategoryFlat[], Response>("categories", () =>
        fetch("/api/categories").then(handleResponse),
        { retry: false }
    );

interface useChangesProps {
    start?: DateTime
    end?: DateTime
    n?: number
}
export const useChanges = (id: number, { start, end, n }: useChangesProps) => {
    var searchParams = new URLSearchParams();
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
    return useQuery<AccountChange[], Response>("changes", () =>
        fetch(`/api/accounts/${id}/changes?${searchParams.toString()}`)
            .then(handleResponse),
        { retry: false }
    );
}

