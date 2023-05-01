import { ModalsProvider } from "@mantine/modals";
import { ReactNode } from "react";
import { AddTransactionModal, EditTransactionModal } from "../components/transaction/TransactionModal";
import { AccountModal } from "../components/account/AccountModal";
import { CategoryModal } from "../components/category/CategoryModal";
import { AddTransferModal, EditTransferModal } from "../components/transfer/TransferModal";

export default function FinnanceModalProvider({ children }: { children: ReactNode }) {
    return <ModalsProvider modals={{
        add_transaction: AddTransactionModal,
        edit_transaction: EditTransactionModal,
        add_transfer: AddTransferModal,
        edit_transfer: EditTransferModal,
        account: AccountModal,
        category: CategoryModal
    }}>
        {children}
    </ModalsProvider>
}