import { Button, Collapse, Grid, Pagination, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { TbFilter } from "react-icons/tb";
import { searchParamsProps } from "../actions/query";

interface FilterFormValues {
    search: string | undefined
    start: Date | undefined
    end: Date | undefined
}

export interface FilterRequest extends searchParamsProps {
    page: number
    pagesize: 10
    search?: string | undefined
    start?: string | undefined
    end?: string
}

type FilterFormTransform = (fv: FilterFormValues) => FilterRequest

export const useFilterPagination:
    () => [FilterRequest, React.Dispatch<React.SetStateAction<FilterRequest>>] =
    () => {
        const [filter, setFilter] = useState<FilterRequest>({
            page: 0,
            pagesize: 10
        });
        return [filter, setFilter]
    }

interface FilterPaginationProps {
    filter: FilterRequest,
    setFilter: React.Dispatch<React.SetStateAction<FilterRequest>>,
    pages: number | undefined
}

export const FilterPagination = ({ filter, setFilter, pages }: FilterPaginationProps) => {
    const form = useForm<FilterFormValues, FilterFormTransform>({
        transformValues: fv => ({
            ...filter,
            search: fv.search,
            start: fv.start ? DateTime.fromJSDate(fv.start).toISO({ includeOffset: false }) ?? undefined : undefined,
            end: fv.end ? DateTime.fromJSDate(fv.end).toISO({ includeOffset: false }) ?? undefined : undefined,
        })
    });
    useEffect(() => {
        if (!!pages && pages <= filter.page)
            setFilter({
                ...filter,
                page: Math.max(pages - 1, 0)
            })
        // eslint-disable-next-line
    }, [pages, filter.page]);
     

    const [ open, { toggle }] = useDisclosure(false);

    return <>
        <Grid justify='space-between'>
            <Grid.Col span={12} sm='content' order={2} orderSm={1}>
                <Button variant='default' onClick={toggle} leftIcon={
                    <TbFilter size={24}/>
                }>filter
                </Button>
            </Grid.Col>
            <Grid.Col span={12} sm='content' order={1} orderSm={2}>
                <Pagination size='md' withControls={false} grow
                    value={filter.page + 1} total={pages ?? 0}
                    onChange={page => setFilter({...filter, page: page - 1})}
                />
            </Grid.Col>
        </Grid>
        <Collapse in={open} pt='sm'>
            <form onSubmit={form.onSubmit(setFilter)}>
                <TextInput label='search' {...form.getInputProps('search')} />
                <DateTimePicker label='min date' {...form.getInputProps('start')} clearable />
                <DateTimePicker label='max date' {...form.getInputProps('end')} clearable />
                <Button type='submit' fullWidth mt='sm'>apply</Button>
            </form>
        </Collapse>
    </>
}
