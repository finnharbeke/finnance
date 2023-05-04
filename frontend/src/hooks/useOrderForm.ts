import { useForm } from "@mantine/form";

export type OrderFormValues = { orders: number[];}

export const useOrderForm = (data: OrderFormValues) => {
    const form = useForm<OrderFormValues>({
        initialValues: data
    });

    const leastOrder = (order: number) => {
        return form.values.orders.reduce((b, o) => order < o && b, true)
    }
    
    const largestOrder = (order: number) => {
        return form.values.orders.reduce((b, o) => order > o && b, true)
    }
    
    const nextOrder = (order: number) => {
        let next = undefined;
        let minNext = Infinity;
        for (let other in form.values.orders) {
            const other_order = form.values.orders[other];
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
        for (let other in form.values.orders) {
            const other_order = form.values.orders[other];
            if (other_order < order && other_order > maxLast) {
                last = parseInt(other);
                maxLast = other_order;
            }
        }
        return last;
    }

    const swap = (ix1: number, ix2: number) => {
        const order1 = form.values.orders[ix1];
        const order2 = form.values.orders[ix2];
        form.setFieldValue(`orders.${ix1}`, order2);
        form.setFieldValue(`orders.${ix2}`, order1);
    }

    const moveUp = (ix: number) => {
        const order = form.values.orders[ix];
        if (leastOrder(order))
            return;
        const other = lastOrder(order);
        if (other !== undefined)
            swap(ix, other);
    }

    const moveDown = (ix: number) => {
        const order = form.values.orders[ix];
        if (largestOrder(order))
            return;
        const other = nextOrder(order);
        if (other !== undefined)
            swap(ix, other);
    }

    return { form, moveUp, moveDown };
}