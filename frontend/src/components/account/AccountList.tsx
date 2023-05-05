import { OrderFormValues } from "../../hooks/useOrderForm";
import { AccountDeepQueryResult, useEditAccountOrders } from "../../types/Account";
import { OrderForm } from "../OrderForm";
import { AccountEdit } from "./AccountForm";

export default function AccountFormList({ accounts: unsorted }: { accounts: AccountDeepQueryResult[] }) {
    const accounts = unsorted.sort((a, b) => a.id - b.id);
    const editAccountOrders = useEditAccountOrders();

    const handleSubmit = (values: OrderFormValues, callback: () => void) => {
        editAccountOrders.mutate({ ...values, ids: accounts.map(a => a.id) }, {
            onSuccess: () => {

                editAccountOrders.reset();
            }, onSettled: callback
        });
    }

    return <OrderForm title={'accounts'} titleOrder={1}
        orders={accounts.map(a => a.order)}
        data={accounts} cell={AccountEdit}
        onSubmit={handleSubmit}
    />
}