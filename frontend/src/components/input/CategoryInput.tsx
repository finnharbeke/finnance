import { Select, SelectProps } from "@mantine/core";
import useIsPhone from "../../hooks/useIsPhone";
import Placeholder from "../Placeholder";
import { CategoryDescQueryResult, useCategoryDescs } from "../../types/Category";

interface CategoryInputProps extends Omit<SelectProps, 'data'> {
    is_expense: boolean
    must_be_usable: boolean
    except?: string
}

const CategoryInput = ({ is_expense, must_be_usable, except, ...others }: CategoryInputProps) => {
    const isPhone = useIsPhone();
    const query = useCategoryDescs(is_expense);

    if (!query.isSuccess)
        return <Placeholder queries={[query]} height={30} />

    const except_filter = (cat: CategoryDescQueryResult): boolean => {
        if (!except)
            return true;
        if (cat.desc === except)
            return false;
        if (cat.parent_desc !== cat.desc)
            return except_filter(
                query.data.reduce((prev, curr) => curr.desc === cat.parent_desc ? curr : prev)
            )
        return true;
    }
    const categories = query.data.filter(except_filter);
    return <Select
        searchable={!isPhone} comboboxProps={{ withinPortal: false }}
        data={categories.filter(
            cat => (!must_be_usable) || cat.usable
        ).map(
            cat => ({
                value: cat.id.toString(),
                label: cat.desc,
                group: cat.parent_desc
            })
        )}
        {...others}
    />
}

export default CategoryInput;