import { showNotification } from "@mantine/notifications";
import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { getAxiosData } from "./useQuery";

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