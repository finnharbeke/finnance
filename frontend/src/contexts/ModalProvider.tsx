import { ModalsProvider } from "@mantine/modals";
import { ReactNode } from "react";
import { TransactionModal } from "../components/modals/Transaction";

export default function FinnanceModalProvider({ children }: { children: ReactNode }) {
    return <ModalsProvider modals={{
        transaction: TransactionModal
    }}>
        {children}
    </ModalsProvider>
}