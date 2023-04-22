import { ModalsProvider } from "@mantine/modals";
import { ReactNode } from "react";
import { TransactionModal } from "../components/modals/TransactionModal";
import { AccountModal } from "../components/account/AccountModal";
import { CategoryModal } from "../components/category/Categories";
import TransferForm from "../components/transfer/TransferModal";

export default function FinnanceModalProvider({ children }: { children: ReactNode }) {
    return <ModalsProvider modals={{
        transaction: TransactionModal,
        transfer: TransferForm,
        account: AccountModal,
        category: CategoryModal
    }}>
        {children}
    </ModalsProvider>
}