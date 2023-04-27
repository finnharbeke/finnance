import { Paper, Grid, ColorSwatch, TextInput, Title, Group, Collapse } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";
import { TbChevronDown, TbChevronRight, TbDeviceFloppy, TbRotate2, TbChevronUp } from "react-icons/tb";
import useIsPhone from "../../hooks/useIsPhone";
import { CategoryQueryResult, useCategories, useCategoryForm, useEditCategory, CategoryRequest } from "../../types/Category";
import { SecondaryIcon, PrimaryIcon, RedIcon } from "../Icons";
import Placeholder from "../Placeholder";
import { useCategoryList } from "./CategoriesList";
import CategoryForm from "./CategoryForm";

interface CategoryEditProps {
    category: CategoryQueryResult,
    ix: number
}

export default function CategoryEdit({ category, ix }: CategoryEditProps) {

    const query = useCategories();
    const [open, { toggle, close }] = useDisclosure(false);

    const form = useCategoryForm(category.id, category.is_expense, {
        desc: category.desc,
        color: category.color,
        parent_id: category.parent_id ? category.parent_id.toString() : undefined,
        usable: category.usable
    });
    const editCategory = useEditCategory(category.id);

    const [editing, { open: startEdit, close: endEdit }] = useDisclosure(false);

    const reset = () => {
        const vals = {
            desc: category.desc,
            color: category.color,
            parent_id: category.parent_id ? category.parent_id.toString() : undefined,
            usable: category.usable
        };
        form.setValues(vals);
        form.resetDirty(vals);
        close();
    }

    // disable: missing dependency form, but should only reset
    // on change of data
    // eslint-disable-next-line
    useEffect(reset, [category.desc, category.color, category.usable, category.parent_id])

    const handleSubmit = (values: CategoryRequest) => {
        startEdit();
        editCategory.mutate(
            values,
            {
                onSuccess: () => {
                    editCategory.reset();
                }, onSettled: endEdit
            }
        );
    }

    const isPhone = useIsPhone();
    const { moveUp, moveDown } = useCategoryList();

    if (!query.isSuccess)
        return <Placeholder queries={[query]} />

    return <Paper withBorder p='xs'>
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
                        // <Link to={`${data.id}`} className={classes.AccountLink}>
                        <Title order={3} lineClamp={1} >
                            {form.values.desc}
                        </Title>
                        // </Link>
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
                                    onClick={reset}
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
                <CategoryForm form={form} modal={false} is_expense={category.is_expense} />
            </Collapse>
        </form>
    </Paper>
}