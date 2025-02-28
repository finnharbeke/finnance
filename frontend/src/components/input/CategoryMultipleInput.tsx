import { MultiSelect, MultiSelectProps, ComboboxData } from "@mantine/core";
import useIsPhone from "../../hooks/useIsPhone";
import Placeholder from "../Placeholder";
import {CategoryGroupDescQueryResult, useCategoryGroupDescs } from "../../types/Category";



const CategoryMultipleInput = ({ ...others }) => {
    const isPhone = useIsPhone();
    const query = useCategoryGroupDescs(true);

    if (!query.isSuccess)
        return <Placeholder queries={[query]} height={30} />


    const categories: CategoryGroupDescQueryResult[] = query.data?.map(
            group => ({
                group: group.group,
                items: group.items
            })
        ).filter(group => group.items.length > 0);

    const data: ComboboxData = categories?.map(group => ({
        group: group.group,
        items: group.items.map(
            cat => ({
                value: cat.id.toString(),
                label: cat.desc,
            })
        )
    }));
        
    return <MultiSelect
        comboboxProps={{withinPortal: true}}
        data={data}
        {...others}
    />
}

export default CategoryMultipleInput;