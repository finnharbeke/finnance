import { ComboboxData, Select, SelectProps } from "@mantine/core";
import { useEffect } from "react";
import { CategoryDescQueryResult, CategoryGroupDescQueryResult, useCategoryGroupDescs } from "../../types/Category";
import Placeholder from "../Placeholder";

interface CategoryInputProps extends Omit<SelectProps, 'data'> {
    is_expense: boolean
    must_be_usable: boolean
    except?: string
}

const CategoryInput = ({ is_expense, must_be_usable, except, ...others }: CategoryInputProps) => {
    const query = useCategoryGroupDescs(is_expense);

    useEffect(() => console.log(query.data), [query.data])
    
    if (!query.isSuccess)
        return <Placeholder queries={[query]} height={30} />
    
    const except_filter = (cat: CategoryDescQueryResult, others: CategoryDescQueryResult[]): boolean => {
        if (!except)
            return true;
        if (cat.desc === except)
            return false;
        if (cat.parent_desc !== cat.desc)
            return except_filter(
                others.reduce((prev, curr) => curr.desc === cat.parent_desc ? curr : prev),
                others
            );
        return true;
    }
    const categories: CategoryGroupDescQueryResult[] = query.data?.map(
        group => ({
            group: group.group,
            items: group.items.filter(cat => except_filter(cat, group.items))
        })
    ).filter(group => group.items.length > 0);
    const data: ComboboxData = categories?.map(group => ({
        group: group.group,
        items: group.items.filter(
            cat => (!must_be_usable) || cat.usable
        ).map(
            cat => ({
                value: cat.id.toString(),
                label: cat.desc,
            })
        )
    }));
    return <Select
        searchable comboboxProps={{ withinPortal: true }}
        data={data}
        {...others}
    />
}

export default CategoryInput;