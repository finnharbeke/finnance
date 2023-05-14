import { useMantineTheme } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { SpotlightAction, SpotlightProvider } from "@mantine/spotlight";
import { ReactNode, useEffect } from "react";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { TbArrowsRightLeft, TbCirclePlus, TbLink, TbTemplate } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { useAccounts } from "../types/Account";
import { useTemplates } from "../types/Template";
import { addTransactionAction, addTransferAction } from "./actions";

export const FinnanceSpotlight = ({ children }: { children: ReactNode }) => {
    const theme = useMantineTheme();
    const navigate = useNavigate(); 
    const tempQuery = useTemplates();
    const accQuery = useAccounts();

    const [actions, { setState }] = useListState<SpotlightAction>();

    useEffect(() => {
        const basics: SpotlightAction[] = [{
            title: 'add transaction',
            onTrigger: () => addTransactionAction({}),
            icon: <TbCirclePlus size="1.2rem"
                color={theme.fn.primaryColor()}
            />,
        }, {
            title: 'add account transfer',
            onTrigger: () => addTransferAction({}),
            icon: <TbArrowsRightLeft size="1.2rem"
                color={theme.colors.grape[theme.fn.primaryShade()]}
            />,
        }];
        if (tempQuery.isSuccess && accQuery.isSuccess)
            setState(basics.concat(
                tempQuery.data.map<SpotlightAction>(t => ({
                    title: `${t.desc}`,
                    onTrigger: () => addTransactionAction({
                        template: t
                    }),
                    icon: <TbTemplate size="1.2rem"
                        color={theme.colors.indigo[theme.fn.primaryShade()]}
                    />
                }))
            ).concat(
                accQuery.data.map<SpotlightAction>(a => ({
                    title: `${a.desc}`,
                    onTrigger: () => navigate(`accounts/${a.id}`),
                    icon: <TbLink size="1.2rem" />
                }))

            ))
    }, [tempQuery, accQuery, setState, navigate, theme])


    return <SpotlightProvider
        actions={actions}
        searchIcon={<AiOutlineThunderbolt size="1.2rem"
            color={theme.colors.indigo[theme.fn.primaryShade()]}
        />}
        searchPlaceholder="quick access..."
        shortcut="mod + k"
        nothingFoundMessage="nothing found..."
        fullScreen={false}
        limit={8}
    >
        {children}
    </SpotlightProvider>
}