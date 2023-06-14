import { useForm } from "@mantine/form";

export interface OrderFormValues {
    array: {
        order: number
        id: number
    }[]
}

export interface OrderRequest {
    orders: number[]
    ids: number[]
}

type Transform = (v: OrderFormValues) => OrderRequest

export const useOrderForm = (data: OrderFormValues) => {
    const form = useForm<OrderFormValues, Transform>({
        initialValues: data,
        transformValues: (fv) => ({
            orders: fv.array.map(x => x.order),  
            ids: fv.array.map(x => x.id),  
        })
    });

    const leastOrder = (order: number) => {
        return form.values.array.reduce((b, o) => order < o.order && b, true)
    }
    
    const largestOrder = (order: number) => {
        return form.values.array.reduce((b, o) => order > o.order && b, true)
    }
    
    const nextOrder = (order: number) => {
        let next = undefined;
        let minNext = Infinity;
        for (let other in form.values.array) {
            const other_order = form.values.array[other].order;
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
        for (let other in form.values.array) {
            const other_order = form.values.array[other].order;
            if (other_order < order && other_order > maxLast) {
                last = parseInt(other);
                maxLast = other_order;
            }
        }
        return last;
    }

    const swap = (ix1: number, ix2: number) => {
        const order1 = form.values.array[ix1].order;
        const order2 = form.values.array[ix2].order;
        form.setFieldValue(`array.${ix2}.order`, order1);
        form.setFieldValue(`array.${ix1}.order`, order2);
    }

    const moveUp = (ix: number) => {
        const order = form.values.array[ix].order;
        if (leastOrder(order))
            return;
        const other = lastOrder(order);
        if (other !== undefined)
            swap(ix, other);
    }

    const moveDown = (ix: number) => {
        const order = form.values.array[ix].order;
        if (largestOrder(order))
            return;
        const other = nextOrder(order);
        if (other !== undefined)
            swap(ix, other);
    }

    const getOrder = (id: number) => {
        const ix = form.values.array.map(x => x.id).indexOf(id);
        return ix === -1 ? -1 : form.values.array[ix].order;
    }

    return { form, moveUp, moveDown, getOrder };
}