import { SpotlightAction, SpotlightProvider } from "@mantine/spotlight";
import { ReactNode } from "react";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { TbArrowsRightLeft, TbCirclePlus } from "react-icons/tb";
import { addTransactionAction, addTransferAction } from "./actions";

export const FinnanceSpotlight = ({ children }: { children: ReactNode }) => {
    // const navigate = useNavigate(); 
    
    const spotlightActions: SpotlightAction[] = [{
        title: 'add transaction',
        onTrigger: () => addTransactionAction({}),
        icon: <TbCirclePlus size="1.2rem" />,
    },{
        title: 'add account transfer',
        onTrigger: () => addTransferAction({}),
        icon: <TbArrowsRightLeft size="1.2rem" />,
    }]

    return <SpotlightProvider
        actions={ spotlightActions }
        searchIcon={<AiOutlineThunderbolt size="1.2rem" />}
        searchPlaceholder="quick access..."
        shortcut="mod + k"
        nothingFoundMessage="nothing found..."
        fullScreen={false}
    >
        { children }
    </SpotlightProvider>
}