import { createContext, ReactNode, useEffect, useState } from "react";
import useErrorHandler from "../hooks/useErrorHandler";
import { NotOKResponseProps } from "./ErrorHandlerProvider";

export interface AuthContextType {
    auth: boolean,
    exists: (username: string) => Promise<FetchReturnProps & ExistsReturnProps>,
    login: (username: string, password: string) => Promise<FetchReturnProps & LoginReturnProps>,
    logout: () => Promise<FetchReturnProps & LogoutReturnProps>,
    checkingSession: boolean
}

interface LoginReturnProps {
    auth?: boolean,
}
interface LogoutReturnProps {
    success?: boolean,
}
interface ExistsReturnProps {
    exists?: boolean,
}
interface FetchReturnProps {
    ok: boolean
}

export const AuthContext = createContext<AuthContextType>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState(false);
    const [checkingSession, setChecking] = useState(true);
    const { responseError, responseErrorFromResponseAndData } = useErrorHandler();

    const handleLogin = async (username: string, password: string) => (
        fetch("/api/login",
            {
                method: 'post',
                body: JSON.stringify({ username, password }),
                signal: AbortSignal.timeout(3000)
            }
        ).then(async r => (
            r.json().then((data: LoginReturnProps | NotOKResponseProps) => {
                if (r.ok)
                    setAuth((data as LoginReturnProps).auth);
                else
                    responseErrorFromResponseAndData(r, (data as NotOKResponseProps))
                return { ok: r.ok, ...(data as LoginReturnProps) }
            })
        ))
    );

    const handleLogout = () => (
        fetch("/api/logout",
            {
                method: 'post',
                signal: AbortSignal.timeout(3000)
            }
        ).then(r => (
            r.json().then((data: LogoutReturnProps | NotOKResponseProps) => {
                if (r.ok)
                    setAuth(!(data as LogoutReturnProps).success);
                else
                    responseErrorFromResponseAndData(r, (data as NotOKResponseProps));
                return { ok: r.ok, ...(data as LogoutReturnProps) };
            })
        ))
    );

    const handleExists = (username: string) => (
        fetch("/api/exists",
            {
                method: 'post',
                body: JSON.stringify({ username }),
                signal: AbortSignal.timeout(3000)
            }
        ).then(async r => (
            r.json().then((data: ExistsReturnProps | NotOKResponseProps) => {
                if (!r.ok)
                    responseErrorFromResponseAndData(r, (data as NotOKResponseProps));
                return { ok: r.ok, ...(data as ExistsReturnProps) }
            })
        ))
    )

    const checkSession = () => {
        fetch("/api/session", {
            signal: AbortSignal.timeout(3000)
        }).then(r => {
            if (r.ok)
                r.json().then((data: LoginReturnProps) => {
                    setChecking(false);
                    setAuth(data.auth);
                })
        })
    }

    const value = {
        auth,
        login: handleLogin,
        logout: handleLogout,
        exists: handleExists,
        checkingSession: checkingSession,
    };

    useEffect(checkSession, []);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};