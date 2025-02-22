import { Center, Collapse, ColorSwatch, Flex, Group, Paper, TextInput, Title } from "@mantine/core";
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
            <Flex gap={isPhone ? 'xs' : 'sm'}>
                <SecondaryIcon
                    icon={open ? TbChevronDown : TbChevronRight}
                    onClick={toggle}
                    style={{ flexGrow: 0 }}
                />
                <Center style={{ flexGrow: 0 }}>
                    <ColorSwatch color={form.values.color} size={20} />
                </Center>
                {open ?
                    <TextInput {...form.getInputProps('desc')} style={{ flexGrow: 1 }} />
                    :
                    // <Link to={`${data.id}`} className={classes.AccountLink}>
                    <Title order={3} lineClamp={1} style={{ flexGrow: 1 }} >
                        {form.values.desc}
                    </Title>
                    // </Link>
                }
                <Group justify='fley-end' gap='xs' style={{ flexGrow: 0 }}>
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
            </Flex>
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