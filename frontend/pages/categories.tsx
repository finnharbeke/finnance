import { Button, Flex, Title } from "@mantine/core";
import { addCategoryAction } from "../actions/actions";
import { CategoryExpensesList, CategoryIncomesList } from "../components/category/CategoriesList";

export default function CategoriesPage() {
    return <>
        <Flex justify='space-between'>
            <Title>categories</Title>
        </Flex>
        <CategoryExpensesList />
        <Button fullWidth my='sm'
            onClick={() => addCategoryAction(true)}>
            new expense category
        </Button>
        <CategoryIncomesList />
        <Button fullWidth mt='sm'
            onClick={() => addCategoryAction(false)}>
            new income category
        </Button>
    </>

}
