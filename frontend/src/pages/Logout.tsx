import { Button } from "@mantine/core";
import { useLogout } from "../components/auth/api";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";

export default function LogoutPage() {
    const logout = useLogout();
    const navigate = useNavigate();

    const [mutating, { open, close }] = useDisclosure(false);

    return <Button fullWidth size='lg' loading={mutating} onClick={ () => {
        open();
        logout.mutate(void{}, {
            onSuccess: () => navigate('/login'),
            onSettled: close
        })
    }}>Log Out</Button>
}