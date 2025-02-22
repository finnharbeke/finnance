import { useMantineTheme } from "@mantine/core";
import { Spotlight, SpotlightActionData } from "@mantine/spotlight";
import { useEffect, useState } from "react";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { TbArrowsRightLeft, TbCirclePlus, TbCoins, TbMoneybag, TbTemplate } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/auth/api";
import { useAccounts } from "../types/Account";
import { useTemplates } from "../types/Template";
import { addTransactionAction, addTransferAction } from "./actions";
import { useDisclosure } from "@mantine/hooks";

export const FinnanceSpotlight = () => {
    const theme = useMantineTheme();
    const auth = useAuth();
    const [query, setQuery] = useState('');
    const tempQuery = useTemplates();
    const accQuery = useAccounts();
    const navigate = useNavigate();

    const [baseActions, ] = useState<SpotlightActionData[]>([{
        id: 'goto-account',
        label: 'go to account',
        onClick: () => setQuery('goto '),
        leftSection: <TbMoneybag size="1.2rem" />,
        closeSpotlightOnTrigger: false
    }, {
        id: 'add-transaction',
        label: 'add transaction',
        onClick: () => addTransactionAction({}),
        leftSection: <TbCirclePlus size="1.2rem"
            color='var(--mantine-primary-color-filled)'
        />,
    }, {
        id: 'add-transfer',
        label: 'add account transfer',
        onClick: () => addTransferAction({}),
        leftSection: <TbArrowsRightLeft size="1.2rem"
        color={`var(--mantine-color-${theme.other.colors.transfer}-filled)`}
        />,
    }]);

    const [actions, setActions] = useState<SpotlightActionData[]>(baseActions);
    const [appended, { open }] = useDisclosure(false);

    useEffect(() => {
        if (tempQuery.isSuccess && accQuery.isSuccess && !appended) {
            setActions(baseActions.concat(
                tempQuery.data.map<SpotlightActionData>(t => ({
                    id: `template-${t.id}`,
                    label: `${t.desc}`,
                    onClick: () => addTransactionAction({
                        template: t
                    }),
                    leftSection: <TbTemplate size="1.2rem"
                        color={theme.other.colors.quick}
                    />
                })).concat(
                    accQuery.data.map<SpotlightActionData>(a => ({
                        id: `account-${a.id}`,
                        label: `${a.desc}`,
                        onClick: () => navigate(`accounts/${a.id}`),
                        leftSection: <TbCoins size="1.2rem" />,
                        keywords: ['goto', `goto ${a.desc}`]
                    }))
                )
            ));
            open();
        }
    }, [accQuery, tempQuery, theme, navigate, baseActions, appended, open])

    return <Spotlight
        disabled={!auth.isSuccess || !auth.data.auth}
        query={query}
        onQueryChange={setQuery}
        actions={actions.filter(a => typeof a.keywords !== 'object' || query.startsWith(a.keywords[0]))}
        searchProps={{
            leftSection: <AiOutlineThunderbolt size="1.2rem"
                color={theme.other.colors.quick}
            />,
            placeholder:"quick access...",
        }}
        shortcut={["mod + k", "mod + p"]}
        nothingFound="nothing found..."
        fullScreen={false}
        limit={8}
    />
}