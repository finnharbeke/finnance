import { Grid, Group, Stack, Title, TitleOrder } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { TbListDetails, TbRotate2 } from "react-icons/tb";
import { OrderFormValues, OrderRequest, useOrderForm } from "../hooks/useOrderForm";
import { PrimaryIcon, RedIcon } from "./Icons";

export interface OrderCellProps<T> {
    data: T
    ix: number
    orderForm: ReturnType<typeof useOrderForm>
}

interface OrderFormProps<T> {
    title: string | undefined
    titleOrder?: TitleOrder
    orders: OrderFormValues
    onSubmit: (fv: OrderRequest, cb: () => void) => void
    data: T[]
    cell: (p: OrderCellProps<T>) => JSX.Element;
}

export function OrderForm<T>(props: OrderFormProps<T>) {
    const { title, titleOrder, onSubmit, data, orders, cell } = props;
    const orderFormReturn = useOrderForm(orders);
    const { form, getOrder } = orderFormReturn;
    const [editing, { open: startEdit, close: endEdit }] = useDisclosure(false);
    const Cell = cell;

    const mapped = <Grid>{
        data.map((d, ix) =>
            <Grid.Col span={12} key={ix} order={getOrder(orders.array[ix].id)}>
                <Cell ix={ix} data={d} orderForm={orderFormReturn}/>
            </Grid.Col>
        )
    }</Grid>

    return <Stack gap='xs' mt='sm'>
        {
            !title && mapped
        }
        
        <Grid justify='space-between' align='flex-end'>
            <Grid.Col span={'auto'}>{
                <Title order={titleOrder || 2}>{title}</Title>
            }</Grid.Col>
            <Grid.Col span='content'>{
                form.isDirty() &&
                <Group gap='xs'>
                    <PrimaryIcon icon={TbListDetails} tooltip='save new order'
                        loading={editing} onClick={() => form.onSubmit((fv) => {
                            startEdit();
                            onSubmit(fv, () => {
                                endEdit();
                                form.resetDirty();
                            });
                        })()} />
                    <RedIcon icon={TbRotate2} tooltip='discard new order'
                        onClick={() => form.setValues(orders)} />
                </Group>
            }</Grid.Col>
        </Grid>
        {
            title && mapped
        }
    </Stack>
}