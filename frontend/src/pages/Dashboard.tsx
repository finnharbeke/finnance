import { ActionIcon, Button, Center, Collapse, createStyles, Divider, Grid, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import { Link } from "react-router-dom";
import FinnanceLogo from "../components/FinnanceLogo";
import LinkButton from "../components/LinkButton";
import { useAccounts } from "../hooks/api/useQuery";
import useIsPhone from "../hooks/useIsPhone";

export default function DashboardPage() {
    const useStyles = createStyles({
        apart: {
            justifyContent: 'space-between',
            width: '100%'
        },
        cursor: {
            ":hover": {
                cursor: 'pointer'
            }
        }
    });
    const { classes } = useStyles();
    const { data, isSuccess } = useAccounts();

    const cols = isSuccess ? data.map(acc => (
        <Grid.Col sm={data.length === 1 ? 12 : 6} key={acc.id}>
            <Button component={Link} to={`/accounts/${acc.id}`} fullWidth classNames={{ label: classes.apart }}>
                <Text align='left'>
                    {acc.desc}
                </Text>
                <Text align='right'>
                    {acc.saldo}
                </Text>
            </Button>
        </Grid.Col>
    )) : [];

    const [opened, handlers] = useDisclosure(false);
    const isPhone = useIsPhone();

    return <>
        {
            cols.length > 0 ?
            <>
                <Grid mb={opened ? 0 : undefined} grow>
                    {cols.slice(0, 2)}
                </Grid>
                <Collapse in={opened}>
                    <Grid mt={0} grow>
                        {cols.slice(2)}
                    </Grid>
                </Collapse>
            </>
            :
            <Title align='center' order={3}>no accounts created yet</Title>
        }
        <Divider 
            my={cols.length > 2 ? undefined : 'lg'}
            p={cols.length > 2 ? (isPhone ? 'sm' : 'xs') : undefined}
            labelPosition="center" onClick={handlers.toggle}
            className={ cols.length > 2 ? classes.cursor : ''}
            label={cols.length > 2 ?
                <ActionIcon size="md">
                    {opened ? <TbChevronUp size={20} /> : <TbChevronDown size={20} />}
                </ActionIcon>
                : null
            }
        />
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