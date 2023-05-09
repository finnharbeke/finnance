import { OrderRequest } from "../../hooks/useOrderForm";
import { CategoryHierarchyQueryResult, useCategoryHierarchy, useEditCategoryOrders } from "../../types/Category";
import { OrderForm } from "../OrderForm";
import Placeholder from "../Placeholder";
import CategoryEdit from "./CategoryEdit";

export const CategoryExpensesList = () => {
    const query = useCategoryHierarchy(true);
    if (!query.isSuccess)
        return <Placeholder queries={[query]} />
    return <CategoryList categories={query.data} title='expenses' />
}

export const CategoryIncomesList = () => {
    const query = useCategoryHierarchy(false);
    if (!query.isSuccess)
        return <Placeholder queries={[query]} />
    return <CategoryList categories={query.data} title='incomes' />
}

interface CategoryListProps {
    categories: CategoryHierarchyQueryResult[]
    title?: string
}

export default function CategoryList({ categories: unsorted, title }: CategoryListProps) {
    const categories = unsorted.sort((a, b) => a.category.id - b.category.id);

    const editCategoryOrders = useEditCategoryOrders();
    const handleSubmit = (values: OrderRequest, callback: () => void) => {
        editCategoryOrders.mutate(values, {
            onSuccess: () => {
                editCategoryOrders.reset();
            }, onSettled: callback
        });
    }

    return <OrderForm title={title}
        orders={{ array: categories.map(a => ({ order: a.category.order, id: a.category.id })) }}
        data={categories} cell={CategoryEdit}
        onSubmit={handleSubmit}
    />
}