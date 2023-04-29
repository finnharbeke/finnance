import { Button } from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { OpenContextModal } from "@mantine/modals/lib/context";
import { useState } from "react";
import { CategoryRequest, useAddCategory, useCategoryForm, useCategoryFormValues } from "../../types/Category";
import CategoryForm from "./CategoryForm";

interface CategoryModalProps {
    is_expense: boolean
}

export const CategoryModal = ({ context, id, innerProps }: ContextModalProps<CategoryModalProps>) => {
    const { is_expense } = innerProps;
    const form = useCategoryForm(is_expense, useCategoryFormValues());

    const [loading, setLoading] = useState(false);
    const addCategory = useAddCategory();

    const handleSubmit = (values: CategoryRequest) => {
        setLoading(true);
        addCategory.mutate(values,
            {
                onSuccess: () => context.closeModal(id),
                onSettled: () => {
                    addCategory.reset();
                    setLoading(false);
                }
            }
        );
    }

    return <form onSubmit={form.onSubmit(handleSubmit)}>
        <CategoryForm form={form} modal={true} is_expense={is_expense} />
        <Button mt='lg' fullWidth type="submit"
            loading={loading}>
            create
        </Button>
    </form>
}

export const openCategoryModal = async (props: OpenContextModal<CategoryModalProps>) => {
    openContextModal({
        ...{
            modal: 'category',
            title: `new ${props.innerProps.is_expense ? 'expense' : 'income'} category`,
            size: 'lg'
        },
        ...props,
        innerProps: props.innerProps
    })
}