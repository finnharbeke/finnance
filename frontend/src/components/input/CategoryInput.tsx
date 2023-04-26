import { Select, SelectProps } from "@mantine/core";
import useIsPhone from "../../hooks/useIsPhone";
import { useCategories } from "../../hooks/api/useQuery";
import Placeholder from "../Placeholder";

interface CategoryInputProps extends Omit<SelectProps, 'data'> {
    is_expense: boolean
}

const CategoryInput = ({ is_expense, ...others }: CategoryInputProps) => {
    const isPhone = useIsPhone();
    const query = useCategories();

    if (!query.isSuccess)
        return <Placeholder queries={[query]} height={30} />

    const categories = query.data;

    return <Select
        searchable={!isPhone} withinPortal
        data={categories.filter(
            cat => cat.usable && cat.is_expense === is_expense
        ).map(
            cat => ({
                value: cat.id.toString(),
                label: cat.desc,
                group: cat.parent_id === null ? cat.desc : cat.parent.desc
            })
        )}
        {...others}
    />
}

export default CategoryInput;