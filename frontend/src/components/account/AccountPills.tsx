import { ActionIcon, Button, Collapse, ColorSwatch, Divider, Grid, Group, Text, Title, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import { AccountDeepQueryResult, useAccounts } from "../../types/Account";
import useIsPhone from "../../hooks/useIsPhone";
import Placeholder from "../Placeholder";
import { Link } from "react-router-dom";
import useAmount from "../../hooks/useAmount";
import { addTransferAction } from "../../actions/actions";
import AccountButton from "./AccountButton";

export default function AccountPills() {
    const isPhone = useIsPhone();
    const [opened, handlers] = useDisclosure(false);
    const query = useAccounts();

    if (!query.isSuccess)
        return <Placeholder queries={[query]} height={150} mb='sm' />

    const { data: accounts } = query;
    const cols = accounts.map(acc => (
        <Grid.Col span={{ sm: accounts.length === 1 ? 12 : 6 }} key={acc.id}>
            <AccountPill account={acc} />
        </Grid.Col>
    ));

    const preview = isPhone ? 2 : 4;
    const more = cols.length > preview;

    return <>
        {
            cols.length > 0 ?
                <>
                    <Grid mb={opened ? 'xs' : 0} grow>
                        {cols.slice(0, preview)}
                    </Grid>
                    <Collapse in={opened}>
                        <Grid grow>
                            {cols.slice(preview)}
                        </Grid>
                    </Collapse>
                </>
                :
                <>
                    <Title ta='center' order={3}>no accounts created yet</Title>
                    <AccountButton />
                </>
        }
        <Divider
            my={more ? undefined : 'lg'}
            p={more ? (isPhone ? 'sm' : 'xs') : undefined}
            labelPosition="center" onClick={handlers.toggle}
            style={{
                ":hover": {
                    cursor: 'pointer'
                }
            }}
            label={more ?
                <ActionIcon size="md" variant='transparent'>
                    {opened ? <TbChevronUp size={20} /> : <TbChevronDown size={20} />}
                </ActionIcon>
                : null
            }
        />
    </>
}

const AccountPill = ({ account: acc }: { account: AccountDeepQueryResult }) => {
    const theme = useMantineTheme();
    const isPhone = useIsPhone();
    const [beingDragged, setBeing] = useState(false);
    const [draggedOver, setDraggedOver] = useState(false);
    const saldo = useAmount(acc.saldo, acc.currency);

    const svg = document.getElementById('transferSVG') as Element;
    const background = theme.other.colors.transfer

    return <>
        <Button component={Link} to={`/accounts/${acc.id}`} fullWidth
            justify='space-between'
            color={beingDragged || draggedOver ? theme.other.colors.transfer : undefined}
            draggable
            onDragStart={(event: DragEvent) => {
                // event.preventDefault();
                setBeing(true);
                event.dataTransfer?.setData("json", JSON.stringify(acc))
                event.dataTransfer?.setDragImage(svg, 0, 25)
            }}
            onDragEnd={() => setBeing(false)}
            onDragLeave={() => setDraggedOver(false)}

            onDragOver={(event: DragEvent) => {
                event.preventDefault();
                setDraggedOver(true);
            }}

            onDrop={(event: DragEvent) => {
                setDraggedOver(false);
                const json = event.dataTransfer?.getData("json");
                if (json === '')
                    return;
                const source = json ? JSON.parse(json) : undefined;
                if (source.id === acc.id)
                    return;
                event.preventDefault();
                addTransferAction({ source, dest: acc });
            }}
            leftSection={
                <Group gap='xs' wrap='nowrap'>
                    <ColorSwatch color={acc.color} size={isPhone ? 24 : 20} />
                    <Text fw={600}>
                        {acc.desc}
                    </Text>
                </Group>
            }
            rightSection={
                <Text fw={600}>{saldo}</Text>
            }
        />
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