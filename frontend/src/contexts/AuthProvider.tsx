import { createContext, ReactNode, useEffect, useState } from "react";
import useErrorHandler from "../hooks/useErrorHandler";
import { NotOKResponseProps } from "./ErrorHandlerProvider";

export interface AuthContextType {
    auth: boolean,
    exists: (username: string) => Promise<FetchReturnProps & ExistsReturnProps>,
    existsMail: (email: string) => Promise<FetchReturnProps & ExistsReturnProps>,
    login: (username: string, password: string) => Promise<FetchReturnProps & LoginReturnProps>,
    register: (username: string, email: string, password: string) => Promise<FetchReturnProps & RegisterReturnProps>,
    logout: () => Promise<FetchReturnProps & LogoutReturnProps>,
    checkingSession: boolean
}

interface LoginReturnProps {
    auth: boolean,
}
interface RegisterReturnProps {
    success: boolean,
}
interface LogoutReturnProps {
    success: boolean,
}
interface ExistsReturnProps {
    exists: boolean,
}
interface FetchReturnProps {
    ok: boolean
}

export function not_defined<T>(): Promise<T> {
    throw new Error("Context function not yet defined.");
}

export const AuthContext = createContext<AuthContextType>({
    auth: false,
    exists: not_defined<FetchReturnProps & ExistsReturnProps>,
    existsMail: not_defined<FetchReturnProps & ExistsReturnProps>,
    login: not_defined<FetchReturnProps & LoginReturnProps>,
    register: not_defined<FetchReturnProps & RegisterReturnProps>,
    logout: not_defined<FetchReturnProps & LogoutReturnProps>,
    checkingSession: false
});

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState(false);
    const [checkingSession, setChecking] = useState(true);
    const { responseErrorFromResponseAndData } = useErrorHandler();

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
    
    const handleRegister = async (username: string, email: string, password: string) => (
        fetch("/api/register",
            {
                method: 'post',
                body: JSON.stringify({ username, email, password }),
                signal: AbortSignal.timeout(3000)
            }
        ).then(async r => (
            r.json().then((data: RegisterReturnProps | NotOKResponseProps) => {
                if (!r.ok)
                    responseErrorFromResponseAndData(r, (data as NotOKResponseProps))
                return { ok: r.ok, ...(data as RegisterReturnProps) }
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
    
    const handleExistsMail = (email: string) => (
        fetch("/api/existsMail",
            {
                method: 'post',
                body: JSON.stringify({ email }),
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
        register: handleRegister,
        logout: handleLogout,
        exists: handleExists,
        existsMail: handleExistsMail,
        checkingSession: checkingSession,
    };

    useEffect(checkSession, []);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};