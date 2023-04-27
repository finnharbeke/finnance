import { Title, Button } from "@mantine/core";
import useIsPhone from "../../hooks/useIsPhone";
import { useCategories } from "../../types/Category";
import Placeholder from "../Placeholder";
import { openCategoryModal } from "./CategoryModal";
import CategoryList from "./CategoriesList";

export default function CategoriesPage() {

    const query = useCategories();
    const isPhone = useIsPhone();

    if (!query.isSuccess)
        return <>
            <Title>categories</Title>
            <Placeholder queries={[query]} />
        </>

    const categories = query.data;
    const expenses = categories.filter(x => x.is_expense)
    const incomes = categories.filter(x => !x.is_expense)

    return <>
        <Title>categories</Title>
        <CategoryList categories={expenses} title='expenses' />
        <Button fullWidth my='sm'
            onClick={() => {
                openCategoryModal({
                    fullScreen: isPhone,
                    innerProps: {
                        is_expense: true,
                    }
                })
            }}>
            new expense category
        </Button>
        <CategoryList categories={incomes} title='income' />
        <Button fullWidth mt='sm'
            onClick={() => {
                openCategoryModal({
                    fullScreen: isPhone,
                    innerProps: {
                        is_expense: false,
                    }
                })
            }}>
            new income category
        </Button>
    </>

}