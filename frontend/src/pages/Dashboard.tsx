import { ActionIcon, Button, Collapse, createStyles, Divider, Grid, Skeleton, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import { Link } from "react-router-dom";
import { useAccounts, useCurrentUser } from "../hooks/useQuery";

export default function DashboardPage() {
    const useStyles = createStyles({
        apart: {
            justifyContent: 'space-between',
            width: '100%'
        }
    });
    const { classes } = useStyles();
    const { data, isSuccess } = useAccounts();

    const cols = isSuccess ? data.map(acc => (
        <Grid.Col sm={data.length === 1 ? 12 : 6} key={acc.id}>
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

    const [opened, handlers] = useDisclosure(false);

    return <>
        {
            cols.length > 0 &&
            <>
                <Grid mb={opened ? 0 : undefined}>
                    {cols.slice(0, 2)}
                </Grid>
                <Collapse in={opened}>
                    <Grid mt={0}>
                        {cols.slice(2)}
                    </Grid>
                </Collapse>
                <Divider my={cols.length > 2 ? undefined : 'sm'} labelPosition="center"
                    label={cols.length > 2 ?
                        <ActionIcon size="sm" onClick={handlers.toggle}>
                            {opened ? <TbChevronUp /> : <TbChevronDown />}
                        </ActionIcon>
                        : null
                    }
                />
                <Stack>
                    <Button color='indigo' fullWidth>Quick Access</Button>
                    <Button fullWidth>Analysis</Button>
                </Stack>
                <Divider my='sm'/>
                <Skeleton height={150} />
                <Divider my='sm'/>
            </>
        }
        <Stack>
            <Button component={Link} to={'/accounts'} fullWidth variant="light">Manage Accounts</Button>
            <Button component={Link} to={'/categories'} fullWidth variant="light">Manage Categories</Button>
        </Stack>
    </>;
}