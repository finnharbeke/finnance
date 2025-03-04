import { Group, Loader } from "@mantine/core";
import { Navigate } from "react-router-dom";
import Placeholder from "../components/Placeholder";
import { useAuth } from "../components/auth/api";

export const AuthRoute = ({ children }: { children: React.ReactNode}) =>
    <RestrictedRoute children={children} wish={true} reroute="/login" />

export const PublicOnlyRoute = ({ children }: { children: React.ReactNode}) =>
    <RestrictedRoute children={children} wish={false} reroute="/" />

interface RestrictedProps {
    children: React.ReactNode
    wish: boolean
    reroute: string
}

const RestrictedRoute = ({ children, wish, reroute }: RestrictedProps) => {
    const query = useAuth();

    if (query.isLoading)
        return <Group mt="xl" justify='center'>
            <Loader size="lg" />
        </Group>

    if (query.isError)
        return <Placeholder queries={[query]} />

    const { auth } = query.data;

    return <>{
        auth === wish ?
            children
            :
            <Navigate replace to={reroute}/>
        }</>
};