import { Flex, Title, Group, Grid, Center } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { createContext, useContext, useEffect } from "react";
import { TbDeviceFloppy, TbRotate2 } from "react-icons/tb";
import { useEditCategoryOrders } from "../../hooks/api/useMutation";
import { CategoryQueryResult } from "../../types/Category";
import { PrimaryIcon, RedIcon } from "../Icons";
import { OrderFormContextType, OrderFormValues, leastOrder, lastOrder, largestOrder, nextOrder } from "../account/AccountList";
import CategoryEdit from "./CategoryEdit";

const CategoryListContext = createContext<OrderFormContextType>({
    moveDown: () => {},
    moveUp: () => {},
});

export const useCategoryList = () => useContext(CategoryListContext);

export default function CategoryList({ categories, title }: { categories: CategoryQueryResult[], title: string }) {

    const initials: () => OrderFormValues = () => ({
        orders: categories.sort((a, b) => a.id - b.id).map(a => a.order),
    })
    let orderForm = useForm<OrderFormValues>({
        initialValues: initials()
    });

    const swap = (ix1: number, ix2: number) => {
        const order1 = orderForm.values.orders[ix1];
        const order2 = orderForm.values.orders[ix2];
        orderForm.setFieldValue(`orders.${ix1}`, order2);
        orderForm.setFieldValue(`orders.${ix2}`, order1);
    }

    const moveUp = (ix: number) => {
        const order = orderForm.values.orders[ix];
        if (leastOrder(order, orderForm.values.orders))
            return;
        const other = lastOrder(order, orderForm.values.orders);
        if (other !== undefined)
            swap(ix, other);
    }

    const moveDown = (ix: number) => {
        const order = orderForm.values.orders[ix];
        if (largestOrder(order, orderForm.values.orders))
            return;
        const other = nextOrder(order, orderForm.values.orders);
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
    useEffect(reset, [...categories.map(a => a.order), categories.length])

    const value: OrderFormContextType = {
        moveUp, moveDown
    }

    const editCategoryOrders = useEditCategoryOrders();
    const [editing, { open: startEdit, close: endEdit }] = useDisclosure(false);
    const handleSubmit = (values: OrderFormValues) => {
        startEdit();
        editCategoryOrders.mutate(values,
            {
                onSuccess: () => {
                    editCategoryOrders.reset();
                }, onSettled: endEdit
            }
        );
    }

    return <CategoryListContext.Provider value={value}>
        <form onSubmit={orderForm.onSubmit(handleSubmit)}>
            <Flex justify='space-between' align='flex-end' pb='sm'>
                <Title order={2}>{title}</Title>
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
        {categories.length > 0 ?
            <Grid>{
                categories.sort((a, b) => a.id - b.id).map((cat, ix) =>
                    <Grid.Col span={12} key={ix} order={orderForm.values.orders[ix]}>
                        <CategoryEdit ix={ix} category={cat} />
                    </Grid.Col>
                )
            }</Grid>
            :
            <Center><Title order={3}>no categories yet</Title></Center>
        }
    </CategoryListContext.Provider>
}