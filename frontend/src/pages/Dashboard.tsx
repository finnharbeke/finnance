import { ActionIcon, Button, Collapse, createStyles, Divider, Grid, Skeleton, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconChevronUp } from "@tabler/icons";
import { useLoaderData } from "react-router";

interface dataType {
    accounts?: { id: number, desc: string, saldo: number }[]
}

export async function loader(): Promise<dataType> {
    const response = await fetch("api/saldos").then(
        r => {
            return r.json()
        }).catch(e => {
            return e.message
        })
    return response;
}

export default function DashboardPage() {
    const useStyles = createStyles({
        apart: {
            justifyContent: 'space-between',
            width: '100%'
        }
    });
    const { classes } = useStyles();
    const data: dataType = useLoaderData();

    const cols = data.accounts.map(acc => (
        <Grid.Col sm={6} key={acc.id}>
            <Button fullWidth classNames={{ label: classes.apart }}>
                <Text>
                {acc.desc}
                </Text>
                <Text>
                {acc.saldo}
                </Text>
            </Button>
        </Grid.Col>
    ));

    const [ opened, handlers ] = useDisclosure(false);
    
    return (
        <>
            <Grid mb={opened ? 0 : undefined}>
                {cols.slice(0, 2)}
            </Grid>
            <Collapse in={opened}>
                <Grid mt={0}>
                    {cols.slice(2)}
                </Grid>
            </Collapse>
            <Divider my="lg" labelPosition="ceneter" label={
                <ActionIcon size="xs" onClick={handlers.toggle}>
                    {opened ? <IconChevronUp/> : <IconChevronDown/>}
                </ActionIcon>
            }/>
            <Stack>
            <Button color='indigo' fullWidth>Quick Access</Button>
            <Button fullWidth>Analysis</Button>
            </Stack>
            <Divider my="lg"/>
            <Skeleton width="100%" height={150} animate={false}/>
            <Divider my="lg"/>
            <Stack>
            <Button fullWidth variant="light">Manage Accounts</Button>
            <Button fullWidth variant="light">Manage Categories</Button>
            </Stack>
        </>
    );
}