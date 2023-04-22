import { ActionIcon, Button, Collapse, Divider, Grid, Text, Title, createStyles } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import { Link } from "react-router-dom";
import { integerToFixed } from "../../helpers/convert";
import { useAccounts } from "../../hooks/api/useQuery";
import Placeholder from "../Placeholder";
import useIsPhone from "../../hooks/useIsPhone";

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

export default function AccountPills() {
    const { classes } = useStyles();
    const isPhone = useIsPhone();
    const [opened, handlers] = useDisclosure(false);
    const query = useAccounts();

    if (!query.isSuccess)
        return <Placeholder queries={[query]} height={150} />

    const { data: accounts } = query;
    const cols = accounts.map(acc => (
        <Grid.Col sm={accounts.length === 1 ? 12 : 6} key={acc.id}>
            <Button component={Link} to={`/accounts/${acc.id}`} fullWidth classNames={{ label: classes.apart }}>
                <Text align='left'>
                    {acc.desc}
                </Text>
                <Text align='right'>
                    {integerToFixed(acc.saldo, acc.currency)}
                </Text>
            </Button>
        </Grid.Col>
    ));

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
            className={cols.length > 2 ? classes.cursor : ''}
            label={cols.length > 2 ?
                <ActionIcon size="md">
                    {opened ? <TbChevronUp size={20} /> : <TbChevronDown size={20} />}
                </ActionIcon>
                : null
            }
        />
        </>
}