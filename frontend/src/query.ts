import { showNotification } from "@mantine/notifications";
import { QueryClient, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { UserQueryResult } from "./types/User";

export const handleAxiosError = (error: unknown) => {
    const e = (error as AxiosError);
    if (e.response) {
        showNotification({
            title: `${e.response.status}: ${e.response.statusText}`,
            message: JSON.stringify(e.response.data),
            color: 'orange',
            autoClose: false
        })
    } else if (e.request) {
        showNotification({
            title: 'no response received',
            message: `${e.config?.method} ${e.config?.url}`,
            color: 'red',
            autoClose: false
        })
    } else {
        showNotification({
            title: 'error on request',
            message: e.message,
            color: 'red',
            autoClose: false
        })
    }
}

export const queryClient = new QueryClient({
    defaultOptions: {
        mutations: {
            onError: handleAxiosError,
            retry: false
        },
        queries: {
            queryFn: async ({ queryKey }) => getAxiosData(`/api/${queryKey.join('/')}`),
            onError: handleAxiosError,
            retry: false
        }
    }
})

export const getAxiosData = async (url: string) => {
    const { data } = await axios.get(url);
    return data;
}

export const useCurrentUser = () =>
    useQuery<UserQueryResult, AxiosError>({ queryKey: ["auth", "me"] });

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

