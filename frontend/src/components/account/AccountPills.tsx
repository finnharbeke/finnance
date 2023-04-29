import { ActionIcon, Button, Collapse, ColorSwatch, Divider, Grid, Group, Text, Title, createStyles, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import { AccountDeepQueryResult, useAccounts } from "../../types/Account";
import useIsPhone from "../../hooks/useIsPhone";
import Placeholder from "../Placeholder";
import { openTransferModal } from "../transfer/TransferModal";
import { Link } from "react-router-dom";
import useAmount from "../../hooks/useAmount";

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
        return <Placeholder queries={[query]} height={150} mb='sm'/>

    const { data: accounts } = query;
    const cols = accounts.map(acc => (
        <Grid.Col sm={accounts.length === 1 ? 12 : 6} key={acc.id}>
            <AccountPill account={acc} />
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

const AccountPill = ({ account: acc }: { account: AccountDeepQueryResult }) => {
    const { classes } = useStyles();
    const theme = useMantineTheme();
    const isPhone = useIsPhone();
    const [beingDragged, setBeing] = useState(false);
    const [draggedOver, setDraggedOver] = useState(false);
    const saldo = useAmount(acc.saldo, acc.currency);

    const svg = document.getElementById('transferSVG') as Element;
    const background = typeof theme.primaryShade === 'number' ?
        theme.colors.grape[theme.primaryShade]
        : theme.colors.grape[theme.primaryShade[theme.colorScheme]];

    return <>
        <Button component={Link} to={`/accounts/${acc.id}`} fullWidth classNames={{ label: classes.apart }}
            color={beingDragged || draggedOver ? 'grape' : undefined}
            draggable
            onDragStart={event => {
                // event.preventDefault();
                setBeing(true);
                event.dataTransfer.setData("json", JSON.stringify(acc))
                event.dataTransfer.setDragImage(svg, 0, 25)
            }}
            onDragEnd={() => setBeing(false)}
            onDragLeave={() => setDraggedOver(false)}

            onDragOver={event => {
                event.preventDefault();
                setDraggedOver(true);
            }}

            onDrop={event => {
                setDraggedOver(false);
                const json = event.dataTransfer.getData("json");
                if (json === '')
                    return;
                const source = JSON.parse(json);
                if (source.id === acc.id)
                    return;
                event.preventDefault();
                openTransferModal({ innerProps: { source, dest: acc } });
            }}
        >
            <Group spacing='xs' noWrap>
                <ColorSwatch color={acc.color} size={isPhone ? 24 : 20} />
                <Text align='left'>
                    {acc.desc}
                </Text>
            </Group>
            <Text align='right'>{saldo}</Text>
        </Button >
        <svg id="transferSVG" style={{ position: 'absolute', left: -1000 }}
            xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrows-left-right" width="32" height="32" viewBox="-8 -8 40 40" stroke={theme.white} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="20" fill={background} stroke="none" />
            <line x1="21" y1="17" x2="3" y2="17" />
            <path d="M6 10l-3 -3l3 -3" />
            <line x1="3" y1="7" x2="21" y2="7" />
            <path d="M18 20l3 -3l-3 -3" />
        </svg>
    </>
}