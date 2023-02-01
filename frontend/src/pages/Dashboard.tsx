import { ActionIcon, Button, Collapse, createStyles, Divider, Grid, Skeleton, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import { useLoaderData } from "react-router";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../hooks/useQuery";
import { AccountFlat } from "../Types/Account";

export default function DashboardPage() {
    const useStyles = createStyles({
        apart: {
            justifyContent: 'space-between',
            width: '100%'
        }
    });
    const { classes } = useStyles();
    const { data, isSuccess, isLoading } = useCurrentUser();
    // const data: {
    //     accounts: AccountFlat[]
    // } = {
    //     accounts: []
    // };

    const cols = (!isLoading && isSuccess) ? data.accounts?.map(acc => (
        <Grid.Col sm={6} key={acc.id}>
            <Button component={Link} to={`/accounts/${acc.id}`} fullWidth classNames={{ label: classes.apart }}>
                <Text>
                {acc.desc}
                </Text>
                <Text>
                {acc.saldo}
                </Text>
            </Button>
        </Grid.Col>
    )) : [];

    const [ opened, handlers ] = useDisclosure(false);
    
    return (
        <>
            <Grid mb={opened ? 0 : undefined}>
                {cols?.slice(0, 2)}
            </Grid>
            <Collapse in={opened}>
                <Grid mt={0}>
                    {cols?.slice(2)}
                </Grid>
            </Collapse>
            <Divider my="lg" labelPosition="center" label={
                <ActionIcon size="xs" onClick={handlers.toggle}>
                    {opened ? <TbChevronUp/> : <TbChevronDown/>}
                </ActionIcon>
            }/>
            <Stack>
            <Button color='indigo' fullWidth>Quick Access</Button>
            <Button fullWidth>Analysis</Button>
            </Stack>
            <Divider my="lg"/>
            <Skeleton width="100%" height={150}/>
            <Divider my="lg"/>
            <Stack>
            <Button fullWidth variant="light">Manage Accounts</Button>
            <Button fullWidth variant="light">Manage Categories</Button>
            </Stack>
        </>
    );
}