import { Select, SelectProps } from "@mantine/core";
import useIsPhone from "../../hooks/useIsPhone";
import Placeholder from "../Placeholder";
import { useCategories } from "../../types/Category";

interface CategoryInputProps extends Omit<SelectProps, 'data'> {
    is_expense: boolean
    must_be_usable: boolean
}

const CategoryInput = ({ is_expense, must_be_usable, ...others }: CategoryInputProps) => {
    const isPhone = useIsPhone();
    const query = useCategories();

    if (!query.isSuccess)
        return <Placeholder queries={[query]} height={30} />

    const categories = query.data;

    return <Select
        searchable={!isPhone} withinPortal
        data={categories.filter(
            cat => (!must_be_usable || cat.usable) && cat.is_expense === is_expense
        ).map(
            cat => ({
                value: cat.id.toString(),
                label: cat.desc,
                group: cat.parent === null ? cat.desc : cat.parent.desc
            })
        )}
        {...others}
    />
}

export default CategoryInput;