import { ActionIcon, Button, Collapse, Flex, Grid, Title } from "@mantine/core";
import { TbEye } from "react-icons/tb";
import useIsPhone from "../../hooks/useIsPhone";
import { DummySunburst } from "../../nivo/Sunburst";
import { useCategories } from "../../types/Category";
import Placeholder from "../Placeholder";
import CategoryList from "./CategoriesList";
import { openCategoryModal } from "./CategoryModal";
import { useDisclosure } from "@mantine/hooks";

export default function CategoriesPage() {
    const query = useCategories();
    const isPhone = useIsPhone();
    const [ open, { toggle }] = useDisclosure();

    if (!query.isSuccess)
        return <>
            <Title>categories</Title>
            <Placeholder queries={[query]} />
        </>

    const categories = query.data;
    const expenses = categories.filter(x => x.is_expense)
    const incomes = categories.filter(x => !x.is_expense)

    return <>
        <Flex justify='space-between'>
            <Title>categories</Title>
            <ActionIcon variant='default' size='lg' onClick={toggle}><TbEye size={20}/></ActionIcon>
        </Flex>
        <Collapse in={open}>
        <Grid>
            <Grid.Col span={4} offset={2}>
                <DummySunburst size={100}/>
            </Grid.Col>
            <Grid.Col span={4}>
                <DummySunburst size={100}/>
            </Grid.Col>
        </Grid>
        </Collapse>
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