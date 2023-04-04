import { showNotification } from "@mantine/notifications";
import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { get } from "./useQuery";

const handleAxiosError = (error: unknown) => {
    const e = (error as AxiosError);
    if (e.response) {
        showNotification({
            title: `status ${e.status}: ${e.response.statusText}`,
            message: JSON.stringify(e.response.data),
            color: 'orange',
            autoClose: true
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
            onError: handleAxiosError
        },
        queries: {
            queryFn: async ({ queryKey }) => get(`/api/${queryKey[0]}`),
            onError: handleAxiosError
        }
    }
})