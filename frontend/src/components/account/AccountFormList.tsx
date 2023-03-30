import { Grid, Title, useMantineTheme } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useListState } from "@mantine/hooks";
import { createContext, useContext } from "react";
import { AccountDeep } from "../../Types/Account";
import { AccountForm, AccountFormValues } from "./AccountForm";

interface AccountFormListContextType {
    setItem: (ix: number, form: UseFormReturnType<AccountFormValues>) => void
    moveUp: (ix: number) => void
    moveDown: (ix: number) => void
}

const AccountFormListContext = createContext<AccountFormListContextType>(null);
export function useAccountFormList() {
    return useContext(AccountFormListContext);
}

export default function AccountFormList({ accounts }: { accounts: AccountDeep[] }) {
    const [forms, handlers] = useListState<UseFormReturnType<AccountFormValues>>([]);

    const moveUp = (ix: number) => {
        if (ix === 0)
            return;
        forms[ix].setFieldValue('ix', ix - 1);
        forms[ix - 1].setFieldValue('ix', ix);
        forms[ix].setFieldValue('order', accounts[ix - 1].order);
        forms[ix - 1].setFieldValue('order', accounts[ix].order);
        handlers.reorder({ from: ix, to: ix - 1 });
    }

    const moveDown = (ix: number) => {
        if (ix === accounts.length - 1)
            return;
        forms[ix].setFieldValue('ix', ix + 1);
        forms[ix + 1].setFieldValue('ix', ix);
        forms[ix].setFieldValue('order', accounts[ix + 1].order);
        forms[ix + 1].setFieldValue('order', accounts[ix].order);
        handlers.reorder({ from: ix, to: ix + 1 });
    }

    // const resetAll = () => forms.map(f => f.reset())
    // const anyDirty = () => forms.reduce((b, f) => b || f.isDirty(), false)
    // const handleSubmit = () => forms.map(
    //     form => form.onSubmit(() => {

    //     })
    // )

    const value: AccountFormListContextType = {
        setItem: handlers.setItem, moveUp, moveDown
    }

    return (
        <AccountFormListContext.Provider value={value}>
            <Title order={1} mb='sm'>accounts</Title>
            <Grid>{
                accounts.map((d, ix) =>
                    <AccountForm data={d} key={ix} ix={ix} />
                )
            }</Grid>
        </AccountFormListContext.Provider>
    );
}