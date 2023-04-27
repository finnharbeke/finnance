import { useForm } from "@mantine/form";
import { RecordQueryResult } from "./Record";
import { UserQueryResult } from "./User";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export interface CategoryQueryResult {
    id: number,
    desc: string,
    is_expense: boolean,
    usable: boolean,
    parent_id: number | null,
    color: string,
    order: number,
    user_id: number,
    parent: CategoryQueryResult,
    type: 'category'
}
export interface CategoryDeepQueryResult extends CategoryQueryResult {
    user: UserQueryResult,
    records: RecordQueryResult[],
    children: CategoryQueryResult[],
}

export interface CategoryFormValues {
    desc: string
    color: string
    parent_id: string | undefined
    usable: boolean
}

export interface CategoryRequest extends Omit<CategoryFormValues, 'parent_id'> {
    parent_id: number | null
    is_expense: boolean
}

export const emptyCategory: () => CategoryFormValues = () => ({
    desc: '', color: '', parent_id: undefined, usable: true
})

export type CategoryTransform = (v: CategoryFormValues) => CategoryRequest

export const useCategoryForm = (id: number | undefined, is_expense: boolean, initial: CategoryFormValues) =>
    useForm<CategoryFormValues, CategoryTransform>({
        initialValues: initial,
        validate: {
            desc: (val) => (val && val.length > 0) ? null : "enter category name",
            color: (val) => (val && /^#([0-9A-Fa-f]{6})$/i.test(val)) ? null : "enter hex color",
        },
        transformValues: (fv) => ({
            ...fv,
            parent_id: fv.parent_id ? parseInt(fv.parent_id) : null,
            is_expense
        })
    })

export const useCategories = () =>
    useQuery<CategoryQueryResult[], AxiosError>({ queryKey: ["categories"] });

export const useAddCategory = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: CategoryRequest) =>
            axios.post(`/api/categories/add`, values),
        onSuccess: () => queryClient.invalidateQueries(["categories"])
    });
}

export const useEditCategory = (id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: CategoryRequest) =>
            axios.put(`/api/categories/${id}/edit`, values),
        onSuccess: () => queryClient.invalidateQueries(["categories"])
    });
}