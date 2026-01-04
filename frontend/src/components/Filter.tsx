import { Button, Collapse, Grid, Pagination, Select, Stack, TextInput, Group, Text } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { TbFilter } from "react-icons/tb";
import { searchParamsProps } from "../query";
import CategoryInput from "./input/CategoryInput";

interface FilterFormValues {
    search: string | undefined
    start: Date | undefined
    end: Date | undefined
    expenseCategory: string[] | undefined
    incomeCategory: string[] | undefined
}

export interface FilterRequest extends searchParamsProps {
    page: number
    pagesize: 10
    search?: string | undefined
    start?: string | undefined
    end?: string
    expenseCategory?: string[] | undefined
    incomeCategory?: string[] | undefined
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
    const [showExpenseCats, setShowExpenseCats] = useState(false);
    const [showIncomeCats, setShowIncomeCats] = useState(false);
    
    const form = useForm<FilterFormValues, FilterFormTransform>({
        initialValues: {
            search: filter.search,
            expenseCategory: filter.expenseCategory || [],
            incomeCategory: filter.incomeCategory || [],
            start: filter.start ? new Date(filter.start) : undefined,
            end: filter.end ? new Date(filter.end) : undefined
        },
        transformValues: fv => ({
            ...filter,
            search: fv.search,
            expenseCategory: fv.expenseCategory && fv.expenseCategory.length > 0 ? fv.expenseCategory : undefined,
            incomeCategory: fv.incomeCategory && fv.incomeCategory.length > 0 ? fv.incomeCategory : undefined,
            start: fv.start ? DateTime.fromJSDate(fv.start).toISO({ includeOffset: false }) : undefined,
            end: fv.end ? DateTime.fromJSDate(fv.end).toISO({ includeOffset: false }) : undefined
        })
    });
    
    // Update form when filter changes
    useEffect(() => {
        form.setValues({
            search: filter.search,
            expenseCategory: filter.expenseCategory || [],
            incomeCategory: filter.incomeCategory || [],
            start: filter.start ? new Date(filter.start) : undefined,
            end: filter.end ? new Date(filter.end) : undefined
        });
    }, [filter]);
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
            <Grid.Col span={{base: 12, sm: 'content'}} order={{base: 2, sm: 1}}>
                <Button variant='default' onClick={toggle} leftSection={
                    <TbFilter size={24}/>
                }>filter
                </Button>
            </Grid.Col>
            <Grid.Col span={{base: 12, sm: 'content'}} order={{base: 1, sm: 2}}>
                <Pagination size='md' withControls={false}
                    value={filter.page + 1} total={pages ?? 0}
                    onChange={page => setFilter({...filter, page: page - 1})}
                />
            </Grid.Col>
        </Grid>
        <Collapse in={open} pt='sm'>
            <form onSubmit={form.onSubmit(setFilter)}>
                <TextInput label='search (comment/agent)' {...form.getInputProps('search')} />
                <Text fw={500} size='sm' mt='md' mb='xs'>search (category)</Text>
                <Group grow>
                    <Button 
                        variant={showExpenseCats ? 'filled' : 'default'}
                        onClick={() => setShowExpenseCats(!showExpenseCats)}
                    >
                        Expense Categories
                    </Button>
                    <Button 
                        variant={showIncomeCats ? 'filled' : 'default'}
                        onClick={() => setShowIncomeCats(!showIncomeCats)}
                    >
                        Income Categories
                    </Button>
                </Group>
                {showExpenseCats && (
                    <CategoryInput 
                        is_expense={true}
                        must_be_usable={false}
                        clearable
                        searchable
                        {...form.getInputProps('expenseCategory')}
                    />
                )}
                {showIncomeCats && (
                    <CategoryInput 
                        is_expense={false}
                        must_be_usable={false}
                        clearable
                        searchable
                        {...form.getInputProps('incomeCategory')}
                    />
                )}
                <DateTimePicker label='min date' {...form.getInputProps('start')} clearable />
                <DateTimePicker label='max date' {...form.getInputProps('end')} clearable />
                <Button type='submit' fullWidth mt='sm'>apply</Button>
            </form>
        </Collapse>
    </>
}