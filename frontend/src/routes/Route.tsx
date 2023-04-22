import { Group, Loader } from "@mantine/core";
import { Outlet, useLocation } from "react-router";
import { useNavigate } from "react-router-dom";
import Placeholder from "../components/Placeholder";
import { useAuth } from "../components/auth/api";

interface AuthRouteProps {
    private_: boolean
}

export const AuthRoute = ({ private_ }: AuthRouteProps) => {
    const query = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    if (query.isLoading)
        return <Group mt="xl" position="center">
            <Loader size="lg" />
        </Group>
    
    if (query.isError)
        return <Placeholder queries={[query]}/>
    
    const { auth } = query.data;

    if (auth === private_)
        return <Outlet />

    navigate(private_ ? "/login" : "/", {
        replace: true,
        state: {
            from: location
        }
    });
    return <></>
};