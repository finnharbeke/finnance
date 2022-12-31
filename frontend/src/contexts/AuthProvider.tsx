import { createContext, ReactNode, useState } from "react";

export interface AuthContextType {
    token: string,
    login: (username: string, password: string) => Promise<LoginResponseType>,
    logout: () => Promise<Response>
}

interface LoginResponseType {
    success?: boolean,
    token?: string,
    error?: string,
    status?: number
}
interface LogoutResponseType {
    success: boolean,
}

export const AuthContext = createContext<AuthContextType>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState('');

    const handleLogin = async (username: string, password: string) => (
        fetch("api/login",
            {
                method: 'post',
                body: JSON.stringify({ username, password }),
                signal: AbortSignal.timeout(3000)
            }
        ).then(r => (
            r.status === 200 ?
                r.json().then((data: LoginResponseType) => {
                    if (data.success) {
                        setToken(data.token);
                    }
                    return { status: r.status, ...data }
                })
                :
                r.text().then(data => (
                    { status: r.status, error: data }
                ))
        ))
    );

    const handleLogout = () => (
        fetch("api/logout",
            {
                method: 'post',
                signal: AbortSignal.timeout(3000)
            }
        ).then(r => {
            if (r.status === 200)
                r.json().then((data: LogoutResponseType) => {
                    if (data.success) {
                        setToken(null);
                    }
                })
            return r
        })
    );

    const value = {
        token,
        login: handleLogin,
        logout: handleLogout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};