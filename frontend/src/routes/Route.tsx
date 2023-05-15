import { Group, Loader } from "@mantine/core";
import { Navigate } from "react-router-dom";
import Placeholder from "../components/Placeholder";
import { useAuth } from "../components/auth/api";

export const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    const query = useAuth();

    if (query.isLoading)
        return <Group mt="xl" position="center">
            <Loader size="lg" />
        </Group>

    if (query.isError)
        return <Placeholder queries={[query]} />

    const { auth } = query.data;

    return <>{
        auth ?
            children
            :
            <Navigate replace to="/login"/>
        }</>
    };