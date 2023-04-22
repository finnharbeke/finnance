import { Center, Stack } from "@mantine/core";
import FinnanceLogo from "../components/FinnanceLogo";
import LinkButton from "../components/LinkButton";
import AccountPills from "../components/account/AccountPills";

export default function DashboardPage() {
    return <>
        <AccountPills/>
        {/* <Stack>
            <Button color='indigo' fullWidth>Quick Access</Button>
            <Button fullWidth>Analysis</Button>
        </Stack>
        <Divider my='sm'/>
        <Skeleton height={150} />
        <Divider my='sm'/> */}
        <Stack>
            <LinkButton to='/accounts' label="manage accounts"></LinkButton>
            <LinkButton to='/categories' label="manage categories"></LinkButton>
        </Stack>
        <Center mt={25}>
            <FinnanceLogo opacity={0.1} size={200}/>
        </Center>
    </>;
}