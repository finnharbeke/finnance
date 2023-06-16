import { Collapse, ColorSwatch, Grid, Group, Paper, TextInput, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { TbChevronDown, TbChevronRight, TbChevronUp, TbDeviceFloppy, TbRotate2 } from "react-icons/tb";
import useIsPhone from "../../hooks/useIsPhone";
import { CategoryHierarchyQueryResult, CategoryRequest, useCategoryForm, useCategoryFormValues, useEditCategory } from "../../types/Category";
import { PrimaryIcon, RedIcon, SecondaryIcon } from "../Icons";
import { OrderCellProps } from "../OrderForm";
import CategoryList from "./CategoriesList";
import CategoryForm from "./CategoryForm";

export default function CategoryEdit(props: OrderCellProps<CategoryHierarchyQueryResult>) {
    const { data: { category, children }, ix, orderForm: { moveUp, moveDown} } = props;

    const [open, { toggle }] = useDisclosure(false);

    const initials = useCategoryFormValues(category);
    const form = useCategoryForm(category.is_expense, initials);
    const editCategory = useEditCategory(category.id);

    const [editing, { open: startEdit, close: endEdit }] = useDisclosure(false);

    const handleSubmit = (values: CategoryRequest) => {
        startEdit();
        editCategory.mutate(
            values,
            {
                onSuccess: () => {
                    editCategory.reset();
                },
                onSettled: () => {
                    endEdit();
                    form.resetDirty();
                }
            }
        );
    }

    const isPhone = useIsPhone();

    return <Paper p='xs'>
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid gutter={isPhone ? 'xs' : undefined} align='center'>
                <Grid.Col span='content'>
                    <SecondaryIcon
                        icon={open ? TbChevronDown : TbChevronRight}
                        onClick={toggle}
                    />
                </Grid.Col>
                <Grid.Col span='content'>
                    <ColorSwatch color={form.values.color} size={20} />
                </Grid.Col>
                <Grid.Col span='auto'>
                    {open ?
                        <TextInput {...form.getInputProps('desc')} />
                        :
                        <Title order={3} lineClamp={1} >
                            {form.values.desc}
                        </Title>
                    }
                </Grid.Col>
                <Grid.Col span='content'>
                    <Group position='right' spacing='xs'>
                        {
                            form.isDirty() &&
                            <>
                                <PrimaryIcon type='submit' icon={TbDeviceFloppy} loading={editing}
                                    tooltip='save'
                                />
                                <RedIcon icon={TbRotate2}
                                    onClick={() => form.setValues(initials)}
                                    tooltip='discard'
                                />
                            </>
                        }
                        <SecondaryIcon icon={TbChevronUp}
                            onClick={() => moveUp(ix)}
                        />
                        <SecondaryIcon icon={TbChevronDown}
                            onClick={() => moveDown(ix)}
                        />
                    </Group>
                </Grid.Col>
            </Grid>
            <Collapse in={open}>
                <CategoryForm form={form} modal={false}
                    is_expense={category.is_expense}
                    parent_except={category.desc}/>
            </Collapse>
        </form>
        {
            open && children.length > 0 &&
            <>
            {/* <Button fullWidth /> */}
            <CategoryList categories={children}/>
            </>
        }
    </Paper>
}
