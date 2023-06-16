import { useForm } from "@mantine/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { RecordQueryResult } from "./Record";

export interface CategoryQueryResult {
    id: number,
    desc: string,
    is_expense: boolean,
    usable: boolean,
    parent_id: number | null,
    color: string,
    order: number,
    user_id: number,
    parent: CategoryQueryResult | null,
    type: 'category'
}
export interface CategoryDeepQueryResult extends CategoryQueryResult {
    records: RecordQueryResult[],
    children: CategoryQueryResult[],
}

export interface CategoryFormValues {
    desc: string
    color: string
    parent_id: string | null
    usable: boolean
}

export interface CategoryRequest extends Omit<CategoryFormValues, 'parent_id'> {
    parent_id: number | null
    is_expense: boolean
}

export type CategoryTransform = (v: CategoryFormValues) => CategoryRequest

export const useCategoryForm = (is_expense: boolean, initial: CategoryFormValues) =>
    useForm<CategoryFormValues, CategoryTransform>({
        initialValues: initial,
        validate: {
            desc: val => (val && val.length > 0) ? null : "enter category name",
            color: val => (val && /^#([0-9A-Fa-f]{6})$/i.test(val)) ? null : "enter hex color",
        },
        transformValues: (fv) => ({
            ...fv,
            parent_id: fv.parent_id ? parseInt(fv.parent_id) : null,
            is_expense
        })
    })

export const useCategoryFormValues: (cat?: CategoryQueryResult) => CategoryFormValues
    = cat => {
        const build: () => CategoryFormValues = () => cat ? {
            desc: cat.desc,
            color: cat.color,
            parent_id: cat.parent_id ? cat.parent_id.toString() : null,
            usable: cat.usable
        } : {
            desc: '', color: '',
            parent_id: null, usable: true
        }
        const [fv, setFV] = useState(build());
        // eslint-disable-next-line
        useEffect(() => setFV(build()), [cat]);
        return fv;
    }

export interface CategoryDescQueryResult {
    id: number
    desc: string
    parent_desc: string
    usable: boolean
}

export const useCategoryDescs = (is_expense: boolean) =>
    useQuery<CategoryDescQueryResult[], AxiosError>({
        queryKey: ["categories", is_expense ? "expenses" : "incomes"]
    });
export interface CategoryHierarchyQueryResult {
    category: CategoryQueryResult
    children: CategoryHierarchyQueryResult[]
}

export const useCategoryHierarchy = (is_expense: boolean) =>
    useQuery<CategoryHierarchyQueryResult[], AxiosError>({
        queryKey: ["categories", "hierarchy", is_expense ? "expenses" : "incomes"]
    });


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

export const useEditCategoryOrders = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (values: { orders: number[], ids: number[] }) =>
            axios.put(`/api/categories/orders`, values),
        onSuccess: () => queryClient.invalidateQueries(["categories"])
    });
}