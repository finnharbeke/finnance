import { ActionIcon, Button, Collapse, Flex, Grid, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { TbEye } from "react-icons/tb";
import useIsPhone from "../../hooks/useIsPhone";
import { DummySunburst } from "../../nivo/Sunburst";
import { CategoryExpensesList, CategoryIncomesList } from "./CategoriesList";
import { openCategoryModal } from "./CategoryModal";

export default function CategoriesPage() {
    const isPhone = useIsPhone();
    const [open, { toggle }] = useDisclosure();

    return <>
        <Flex justify='space-between'>
            <Title>categories</Title>
            <ActionIcon variant='default' size='lg' onClick={toggle}><TbEye size={20} /></ActionIcon>
        </Flex>
        <Collapse in={open}>
            <Grid>
                <Grid.Col span={4} offset={2}>
                    <DummySunburst size={100} is_expense />
                </Grid.Col>
                <Grid.Col span={4}>
                    <DummySunburst size={100} is_expense={false} />
                </Grid.Col>
            </Grid>
        </Collapse>
        <CategoryExpensesList />
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
        <CategoryIncomesList />
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