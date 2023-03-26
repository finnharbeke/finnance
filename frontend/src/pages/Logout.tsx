import { Button } from "@mantine/core";
import useAuth from "../hooks/useAuth";

export default function LogoutPage() {
    const { logout } = useAuth();

    return <Button fullWidth size='lg' onClick={ logout }>Log Out</Button>
}