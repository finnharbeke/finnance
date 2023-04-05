import { Flex, Grid, Group, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { createContext, useContext, useEffect } from "react";
import { TbDeviceFloppy, TbRotate2 } from "react-icons/tb";
import { AccountDeep } from "../../Types/Account";
import { useEditAccountOrders } from "../../hooks/api/useMutation";
import { PrimaryIcon, RedIcon } from "../Inputs/Icons";
import { AccountForm } from "./AccountForm";

interface AccountFormListContextType {
    moveUp: (ix: number) => void
    moveDown: (ix: number) => void
}

const AccountFormListContext = createContext<AccountFormListContextType>({
    moveDown: () => {},
    moveUp: () => {},
});

export function useAccountFormList() {
    return useContext(AccountFormListContext);
}

export interface OrderFormValues {
    orders: number[]
    ids: number[]
}

export default function AccountFormList({ accounts }: { accounts: AccountDeep[] }) {

    const initials = () => ({
        orders: accounts.sort((a, b) => a.id - b.id).map(a => a.order),
        ids: accounts.sort((a, b) => a.id - b.id).map(a => a.id),
    })
    let orderForm = useForm<OrderFormValues>({
        initialValues: initials()
    });

    const leastOrder = (order: number) => {
        return orderForm.values.orders.reduce((b, o) => order <= o && b, true)
    }

    const largestOrder = (order: number) => {
        return orderForm.values.orders.reduce((b, o) => order >= o && b, true)
    }

    const nextOrder = (order: number) => {
        let next = undefined;
        let minNext = Infinity;
        for (let other in orderForm.values.orders) {
            const other_order = orderForm.values.orders[other];
            if (other_order > order && other_order < minNext) {
                next = parseInt(other);
                minNext = other_order;
            }
        }
        return next;
    }

    const lastOrder = (order: number) => {
        let last = undefined;
        let maxLast = -Infinity;
        for (let other in orderForm.values.orders) {
            const other_order = orderForm.values.orders[other];
            if (other_order < order && other_order > maxLast) {
                last = parseInt(other);
                maxLast = other_order;
            }
        }
        return last;
    }

    const swap = (ix1: number, ix2: number) => {
        const order1 = orderForm.values.orders[ix1];
        const order2 = orderForm.values.orders[ix2];
        orderForm.setFieldValue(`orders.${ix1}`, order2);
        orderForm.setFieldValue(`orders.${ix2}`, order1);
    }

    const moveUp = (ix: number) => {
        const order = orderForm.values.orders[ix];
        if (leastOrder(order))
            return;
        const other = lastOrder(order);
        if (other !== undefined)
            swap(ix, other);
    }

    const moveDown = (ix: number) => {
        const order = orderForm.values.orders[ix];
        if (largestOrder(order))
            return;
        const other = nextOrder(order);
        if (other !== undefined)
            swap(ix, other);
    }

    const reset = () => {
        orderForm.setValues(initials());
        orderForm.resetDirty(initials());
    }

    // disable: missing dependency form, but should only reset
    // on change of accounts orders
    // eslint-disable-next-line
    useEffect(reset, [...accounts.map(a => a.order), accounts.length])

    const value: AccountFormListContextType = {
        moveUp, moveDown
    }

    const editAccountOrders = useEditAccountOrders();
    const [editing, { open: startEdit, close: endEdit }] = useDisclosure(false);
    const handleSubmit = (values: OrderFormValues) => {
        startEdit();
        editAccountOrders.mutate(values,
            {
                onSuccess: () => {
                    editAccountOrders.reset();
                }, onSettled: endEdit
            }
        );
    }

    return (
        <AccountFormListContext.Provider value={value}>
            <form onSubmit={orderForm.onSubmit(handleSubmit)}>
            <Flex justify='space-between' align='flex-end' pb='sm'>
                <Title order={1}>accounts</Title>
                {orderForm.isDirty() &&
                    <Group spacing='xs'>
                        <PrimaryIcon icon={TbDeviceFloppy} tooltip='save new order'
                            type='submit' loading={editing} />
                        <RedIcon icon={TbRotate2} tooltip='discard new order'
                            onClick={reset} />
                    </Group>
                }
            </Flex>
            </form>
            <Grid>{
                accounts.sort((a, b) => a.id - b.id).map((d, ix) =>
                    <Grid.Col key={ix} span={12} order={orderForm.values.orders[ix]}>
                        <AccountForm data={d} ix={ix} order={orderForm.values.orders[ix]} />
                    </Grid.Col>
                )
            }</Grid>
        </AccountFormListContext.Provider>
    );
}