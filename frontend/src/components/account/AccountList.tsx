import { OrderRequest } from "../../hooks/useOrderForm";
import { AccountDeepQueryResult, useEditAccountOrders } from "../../types/Account";
import { OrderForm } from "../OrderForm";
import { AccountEdit } from "./AccountForm";

export default function AccountFormList({ accounts: unsorted }: { accounts: AccountDeepQueryResult[] }) {
    const accounts = unsorted.sort((a, b) => a.id - b.id);
    const editAccountOrders = useEditAccountOrders();

    const handleSubmit = (values: OrderRequest, callback: () => void) => {
        editAccountOrders.mutate(values, {
            onSuccess: () => {

                editAccountOrders.reset();
            }, onSettled: callback
        });
    }

    return <OrderForm title={'accounts'} titleOrder={1}
        orders={{array: accounts.map(a => ({order: a.order, id: a.id}))}}
        data={accounts} cell={AccountEdit}
        onSubmit={handleSubmit}
    />
}