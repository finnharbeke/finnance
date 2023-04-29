import { ModalsProvider } from "@mantine/modals";
import { ReactNode } from "react";
import { AddTransactionModal } from "../components/modals/TransactionModal";
import { AccountModal } from "../components/account/AccountModal";
import { CategoryModal } from "../components/category/CategoryModal";
import { AddTransferModal } from "../components/transfer/TransferModal";

export default function FinnanceModalProvider({ children }: { children: ReactNode }) {
    return <ModalsProvider modals={{
        add_transaction: AddTransactionModal,
        add_transfer: AddTransferModal,
        account: AccountModal,
        category: CategoryModal
    }}>
        {children}
    </ModalsProvider>
}