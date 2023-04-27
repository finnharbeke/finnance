import { Button, Center, Stack } from "@mantine/core";
import FinnanceLogo from "../components/FinnanceLogo";
import LinkButton from "../components/LinkButton";
import AccountPills from "../components/account/AccountPills";
import useIsPhone from "../hooks/useIsPhone";
import { TbArrowsLeftRight } from 'react-icons/tb'
import { useState } from "react";
import { openTransferModal } from "../components/transfer/TransferModal";

export default function DashboardPage() {
    const isPhone = useIsPhone();
    const [ loading, setLoading ] = useState(false);

    return <>
        <AccountPills/>
        {
            isPhone &&
            <Button color='grape' mb='md' fullWidth loading={loading} leftIcon={
                <TbArrowsLeftRight size={32} />
            } onClick={() => {
                setLoading(true);
                openTransferModal({
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
        </Stack>
        <Center mt={25}>
            <FinnanceLogo opacity={0.1} size={200}/>
        </Center>
    </>;
}