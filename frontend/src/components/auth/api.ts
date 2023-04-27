import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Success } from "../../types/Helpers";

// QUERIES

interface Auth {
    auth: boolean
}

export const useAuth = () =>
    useQuery<Auth, AxiosError>({ queryKey: ["auth"] });

interface Exists {
    exists: boolean
}

export const usernameExists = (username: string) =>
    axios.post<Exists>('/api/auth/exists', { username })
    
export const emailExists = (email: string) =>
    axios.post<Exists>('/api/auth/existsMail', { email })

// MUTATIONS

interface LoginProps {
    username: string
    password: string
}

export const useLogin = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: LoginProps) =>
            axios.post<Auth>('/api/auth/login', values),
        onSuccess: () => queryClient.invalidateQueries(["auth"])
    });
}

interface RegisterProps extends LoginProps {
    email: string
}

export const useRegister = () =>
    useMutation({
        mutationFn: (values: RegisterProps) =>
            axios.post<Success>('/api/auth/register', values),
    })

export const useLogout = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () =>
            axios.post('/api/auth/logout'),
        onSuccess: () => queryClient.invalidateQueries(["auth"])
    });
}
