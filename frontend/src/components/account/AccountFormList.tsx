import { Flex, Grid, Group, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { createContext, useContext } from "react";
import { TbDeviceFloppy, TbRotate2 } from "react-icons/tb";
import { AccountDeep } from "../../Types/Account";
import { PrimaryIcon, RedIcon } from "../Inputs/Icons";
import { AccountForm } from "./AccountForm";

interface AccountFormListContextType {
    moveUp: (ix: number) => void
    moveDown: (ix: number) => void
}

const AccountFormListContext = createContext<AccountFormListContextType>(null);
export function useAccountFormList() {
    return useContext(AccountFormListContext);
}

interface OrderFormValues {
    orders: number[]
}

export default function AccountFormList({ accounts }: { accounts: AccountDeep[] }) {

    const orderForm = useForm<OrderFormValues>({
        initialValues: {
            orders: accounts.map(a => a.order),
        }
    });

    const leastOrder = (order: number) => {
        return orderForm.values.orders.reduce((b, o) => order <= o && b, true)
    }

    const largestOrder = (order: number) => {
        return orderForm.values.orders.reduce((b, o) => order >= o && b, true)
    }

    const nextOrder = (order: number) => {
        let next = undefined;
        let maxNext = undefined;
        for (let other in orderForm.values.orders) {
            const other_order = orderForm.values.orders[other];
            if (other_order > order && (
                next === undefined || other_order < maxNext
            )) {
                next = parseInt(other);
                maxNext = other_order;
            }
        }
        return next;
    }

    const lastOrder = (order: number) => {
        let last = undefined;
        let maxLast = undefined;
        for (let other in orderForm.values.orders) {
            const other_order = orderForm.values.orders[other];
            if (other_order < order && (
                last === undefined || other_order > maxLast
            )) {
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
        swap(ix, other);
    }

    const moveDown = (ix: number) => {
        const order = orderForm.values.orders[ix];
        if (largestOrder(order))
            return;
        const other = nextOrder(order);
        swap(ix, other);
    }

    const value: AccountFormListContextType = {
        moveUp, moveDown
    }

    return (
        <AccountFormListContext.Provider value={value}>
            <Flex justify='space-between' align='flex-end' pb='sm'>
                <Title order={1}>accounts</Title>
                {orderForm.isDirty() &&
                    <Group spacing='xs'>
                        <PrimaryIcon icon={TbDeviceFloppy} tooltip='save new order' />
                        <RedIcon icon={TbRotate2} tooltip='discard new order'
                            onClick={orderForm.reset} />
                    </Group>
                }
            </Flex>
            <Grid>{
                accounts.map((d, ix) =>
                    <Grid.Col key={ix} span={12} order={orderForm.values.orders[ix]}>
                        <AccountForm data={d} ix={ix} />
                    </Grid.Col>
                )
            }</Grid>
        </AccountFormListContext.Provider>
    );
}