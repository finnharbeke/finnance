import { useMantineTheme } from "@mantine/core";
import { SpotlightAction, SpotlightProvider, spotlight } from "@mantine/spotlight";
import { ReactNode, useEffect, useState } from "react";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { TbArrowsRightLeft, TbCirclePlus, TbCoins, TbMoneybag, TbTemplate } from "react-icons/tb";
import { useAuth } from "../components/auth/api";
import { useAccounts } from "../types/Account";
import { useTemplates } from "../types/Template";
import { addTransactionAction, addTransferAction } from "./actions";
import { useRouter } from "next/router";

export const FinnanceSpotlight = ({ children }: { children: ReactNode }) => {
    const theme = useMantineTheme();
    const auth = useAuth();
    const [query, setQuery] = useState('');

    const [actions, setActions] = useState<SpotlightAction[]>([{
        id: 'goto-account',
        title: 'go to account',
        onTrigger: () => setQuery('goto '),
        icon: <TbMoneybag size="1.2rem" />,
        closeOnTrigger: false
    }, {
        id: 'add-transaction',
        title: 'add transaction',
        onTrigger: () => addTransactionAction({}),
        icon: <TbCirclePlus size="1.2rem"
            color={theme.fn.primaryColor()}
        />,
    }, {
        id: 'add-transfer',
        title: 'add account transfer',
        onTrigger: () => addTransferAction({}),
        icon: <TbArrowsRightLeft size="1.2rem"
        color={theme.colors[theme.other.colors.transfer][theme.fn.primaryShade()]}
        />,
    }]);

    return <SpotlightProvider
        disabled={!auth.isSuccess || !auth.data.auth}
        query={query}
        onQueryChange={setQuery}
        actions={actions.filter(a => typeof a.keywords !== 'object' || query.startsWith(a.keywords[0]))}
        onActionsChange={setActions}
        searchIcon={<AiOutlineThunderbolt size="1.2rem"
            color={theme.colors[theme.other.colors.quick][theme.fn.primaryShade()]}
        />}
        searchPlaceholder="quick access..."
        shortcut={["mod + k", "mod + p"]}
        nothingFoundMessage="nothing found..."
        fullScreen={false}
        limit={8}
    >
        {children}
    </SpotlightProvider>
}

export const useAuthSpotlight = () => {
    const theme = useMantineTheme();
    const router = useRouter();
    const tempQuery = useTemplates();
    const accQuery = useAccounts();

    useEffect(() => {
        tempQuery.isSuccess && accQuery.isSuccess &&
            spotlight.registerActions(
                tempQuery.data.map<SpotlightAction>(t => ({
                    id: `template-${t.id}`,
                    title: `${t.desc}`,
                    onTrigger: () => addTransactionAction({
                        template: t
                    }),
                    icon: <TbTemplate size="1.2rem"
                        color={theme.colors[theme.other.colors.quick][theme.fn.primaryShade()]}
                    />
                })).concat(
                    accQuery.data.map<SpotlightAction>(a => ({
                        id: `account-${a.id}`,
                        title: `${a.desc}`,
                        onTrigger: () => router.push(`accounts/${a.id}`),
                        icon: <TbCoins size="1.2rem" />,
                        keywords: ['goto', `goto ${a.desc}`]
                    }))
                )
            )
    }, [accQuery, tempQuery, theme])
}
