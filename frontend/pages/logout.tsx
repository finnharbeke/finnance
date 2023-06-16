import { Button } from "@mantine/core";
import { useLogout } from "../components/auth/api";

export default function LogoutPage() {
    const logout = useLogout();

    return <Button fullWidth size='lg' onClick={ () => logout.mutate() }>Log Out</Button>
}