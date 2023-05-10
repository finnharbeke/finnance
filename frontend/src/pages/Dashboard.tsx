import { Button, Center, Stack } from "@mantine/core";
import { useState } from "react";
import { TbArrowsLeftRight } from 'react-icons/tb';
import FinnanceLogo from "../components/FinnanceLogo";
import LinkButton from "../components/LinkButton";
import AccountPills from "../components/account/AccountPills";
import { openAddTransferModal } from "../components/transfer/TransferModal";
import useIsPhone from "../hooks/useIsPhone";
import { usePrefetch } from "../query";

export default function DashboardPage() {
    const isPhone = useIsPhone();
    const [loading, setLoading] = useState(false);
    usePrefetch();
    return <>
        <AccountPills />
        {
            isPhone &&
            <Button color='grape' mb='md' fullWidth loading={loading} leftIcon={
                <TbArrowsLeftRight size={32} />
            } onClick={() => {
                setLoading(true);
                openAddTransferModal({
                    fullScreen: true,
                    innerProps: {}
                }).then(() => setLoading(false))
            }} />
        }
        {/* <Stack>
            <Button color='indigo' fullWidth>Quick Access</Button>
            <Button fullWidth>Analysis</Button>
        </Stack>
        <Divider my='sm'/>
        <Skeleton height={150} />
        <Divider my='sm'/> */}
        <Stack>
            <LinkButton to='/analysis' label="graphs"></LinkButton>
            <LinkButton to='/accounts' label="manage accounts"></LinkButton>
            <LinkButton to='/categories' label="manage categories"></LinkButton>
            <LinkButton to='/remotes' label="remote transactions"></LinkButton>
        </Stack>
        <Center mt={25}>
            <FinnanceLogo opacity={0.1} size={200} />
        </Center>
    </>;
}