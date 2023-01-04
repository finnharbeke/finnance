import { Group, Loader } from "@mantine/core";
import { Navigate, Outlet, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";

interface AuthRouteProps {
    auth: boolean, redirect: string
}

export const AuthRoute = (props: AuthRouteProps) => {
    const { auth, redirect } = props;
    const { checkingSession } = useAuth();
    const location = useLocation();

    if (checkingSession)
        return <Group mt="xl" position="center">
            <Loader size="lg" />
        </Group>
    if (auth)
        return <Outlet />

    return <Navigate to={redirect} replace state={{ from: location }} />
};

export const PrivateRoute = () => {
    const { auth } = useAuth();
    return <AuthRoute auth={auth} redirect={"/login"} />
}

export const StrictPublicRoute = () => {
    const { auth } = useAuth();
    return <AuthRoute auth={!auth} redirect={"/"} />
}