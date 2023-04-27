import { Title, Button, Grid, createStyles } from "@mantine/core";
import useIsPhone from "../../hooks/useIsPhone";
import { useCategories } from "../../types/Category";
import Placeholder from "../Placeholder";
import { openCategoryModal } from "./CategoryModal";
import CategoryList from "./CategoriesList";
import ExpensesSunburst from "../../nivo/Sunburst";
import { useNavigate } from "react-router-dom";

const useStyles = createStyles({
    cursor: {
        ':hover': {
            cursor: 'pointer'
        }
    }
})

export default function CategoriesPage() {
    const query = useCategories();
    const isPhone = useIsPhone();
    const navigate = useNavigate();
    const { classes: { cursor }} = useStyles();

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
        <Grid onClick={() => navigate('/analysis')} className={cursor}>
            <Grid.Col span={2}>
                {/* <Title order={4}>preview:</Title> */}
            </Grid.Col>
            <Grid.Col span={2}>
                <ExpensesSunburst size={75} interactive={false}/>
            </Grid.Col>
        </Grid>
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