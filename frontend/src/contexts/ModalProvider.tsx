import { ModalsProvider } from "@mantine/modals";
import { ReactNode } from "react";
import { TransactionModal } from "../components/modals/TransactionModal";
import { AccountModal } from "../components/account/AccountModal";
import { CategoryModal } from "../components/category/Categories";

export default function FinnanceModalProvider({ children }: { children: ReactNode }) {
    return <ModalsProvider modals={{
        transaction: TransactionModal,
        account: AccountModal,
        category: CategoryModal
    }}>
        {children}
    </ModalsProvider>
}