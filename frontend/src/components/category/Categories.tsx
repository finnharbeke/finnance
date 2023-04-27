import { Button, Center, Collapse, ColorInput, ColorSwatch, Flex, Grid, Group, Input, Paper, Switch, Text, TextInput, Title } from "@mantine/core";
import { UseFormReturnType, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { OpenContextModal } from "@mantine/modals/lib/context";
import { createContext, useContext, useEffect, useState } from "react";
import { TbChevronDown, TbChevronRight, TbChevronUp, TbCircleCheck, TbDeviceFloppy, TbLock, TbRotate2 } from "react-icons/tb";
import { useEditCategoryOrders } from "../../hooks/api/useMutation";
import useIsPhone from "../../hooks/useIsPhone";
import { CategoryFormValues, CategoryQueryResult, CategoryRequest, CategoryTransform, emptyCategory, useAddCategory, useCategories, useCategoryForm, useEditCategory } from "../../types/Category";
import { PrimaryIcon, RedIcon, SecondaryIcon } from "../Icons";
import Placeholder from "../Placeholder";
import { OrderFormContextType, OrderFormValues, largestOrder, lastOrder, leastOrder, nextOrder } from "../account/AccountList";
import CategoryInput from "../input/CategoryInput";

export const CategoriesPage = () => {

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

const CategoryListContext = createContext<OrderFormContextType>({
    moveDown: () => {},
    moveUp: () => {},
});

function useCategoryList() {
    return useContext(CategoryListContext);
}

export const CategoryList = ({ categories, title }: { categories: CategoryQueryResult[], title: string }) => {

    const initials: () => OrderFormValues = () => ({
        orders: categories.sort((a, b) => a.id - b.id).map(a => a.order),
    })
    let orderForm = useForm<OrderFormValues>({
        initialValues: initials()
    });

    const swap = (ix1: number, ix2: number) => {
        const order1 = orderForm.values.orders[ix1];
        const order2 = orderForm.values.orders[ix2];
        orderForm.setFieldValue(`orders.${ix1}`, order2);
        orderForm.setFieldValue(`orders.${ix2}`, order1);
    }

    const moveUp = (ix: number) => {
        const order = orderForm.values.orders[ix];
        if (leastOrder(order, orderForm.values.orders))
            return;
        const other = lastOrder(order, orderForm.values.orders);
        if (other !== undefined)
            swap(ix, other);
    }

    const moveDown = (ix: number) => {
        const order = orderForm.values.orders[ix];
        if (largestOrder(order, orderForm.values.orders))
            return;
        const other = nextOrder(order, orderForm.values.orders);
        if (other !== undefined)
            swap(ix, other);
    }

    const reset = () => {
        orderForm.setValues(initials());
        orderForm.resetDirty(initials());
    }

    // disable: missing dependency form, but should only reset
    // on change of accounts orders
    // eslint-disable-next-line
    useEffect(reset, [...categories.map(a => a.order), categories.length])

    const value: OrderFormContextType = {
        moveUp, moveDown
    }

    const editCategoryOrders = useEditCategoryOrders();
    const [editing, { open: startEdit, close: endEdit }] = useDisclosure(false);
    const handleSubmit = (values: OrderFormValues) => {
        startEdit();
        editCategoryOrders.mutate(values,
            {
                onSuccess: () => {
                    editCategoryOrders.reset();
                }, onSettled: endEdit
            }
        );
    }

    return <CategoryListContext.Provider value={value}>
        <form onSubmit={orderForm.onSubmit(handleSubmit)}>
            <Flex justify='space-between' align='flex-end' pb='sm'>
                <Title order={2}>{title}</Title>
                {orderForm.isDirty() &&
                    <Group spacing='xs'>
                        <PrimaryIcon icon={TbDeviceFloppy} tooltip='save new order'
                            type='submit' loading={editing} />
                        <RedIcon icon={TbRotate2} tooltip='discard new order'
                            onClick={reset} />
                    </Group>
                }
            </Flex>
        </form>
        {categories.length > 0 ?
            <Grid>{
                categories.sort((a, b) => a.id - b.id).map((cat, ix) =>
                    <Grid.Col span={12} key={ix} order={orderForm.values.orders[ix]}>
                        <CategoryEdit ix={ix} category={cat} />
                    </Grid.Col>
                )
            }</Grid>
            :
            <Center><Title order={3}>no categories yet</Title></Center>
        }
    </CategoryListContext.Provider>
}

interface CategoryEditProps {
    category: CategoryQueryResult,
    ix: number
}

export const CategoryEdit = ({ category, ix }: CategoryEditProps) => {

    const query = useCategories();
    const [open, { toggle }] = useDisclosure(false);

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
        console.log('hi')
        console.log(vals);
        // close();
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

interface CategoryFormProps {
    form: UseFormReturnType<CategoryFormValues, CategoryTransform>
    modal: boolean
    is_expense: boolean
}

const CategoryForm = ({ is_expense, form, modal }: CategoryFormProps) => {
    const isPhone = useIsPhone();
    const query = useCategories();
    if (!query.isSuccess)
        return <Placeholder queries={[query]} />

    return (
        <Grid align='flex-end'>
            {modal &&
                <Grid.Col span={12}>
                    <TextInput label="category name" withAsterisk
                        {...form.getInputProps('desc')}
                    />
                </Grid.Col>
            }
            <Grid.Col sm={4} xs={12}>
                <ColorInput
                    disallowInput={isPhone}
                    label="color" withAsterisk={modal}
                    {...form.getInputProps('color')}
                />
            </Grid.Col>
            <Grid.Col sm={4} xs={12}>
                <CategoryInput label="parent category" is_expense={is_expense}
                    placeholder="select parent" must_be_usable={false}
                    {...form.getInputProps('parent_id')}
                />
            </Grid.Col>
            <Grid.Col sm={4} xs={12}>

                <Input.Wrapper label='lock for records?'>
                    <Center>
                        <Switch color='red'
                            onLabel={
                                <Group noWrap spacing='xs'>
                                    <TbLock size={20} />
                                    <Text>locked</Text>
                                </Group>
                            } offLabel={
                                <Group noWrap spacing='xs'>
                                    <Text>free to use</Text>
                                    <TbCircleCheck size={20} color='green' />
                                </Group>
                            }
                            checked={!form.values.usable}
                            onChange={() => form.setFieldValue('usable', !form.values.usable)}
                        />
                    </Center>
                </Input.Wrapper>
            </Grid.Col>
        </Grid>
    )
}

interface CategoryModalProps {
    is_expense: boolean
}

export const CategoryModal = ({ context, id, innerProps }: ContextModalProps<CategoryModalProps>) => {
    const { is_expense } = innerProps;
    const form = useForm<CategoryFormValues, CategoryTransform>({
        initialValues: emptyCategory(),
    })

    const [loading, setLoading] = useState(false);
    const addCategory = useAddCategory();

    const handleSubmit = (values: CategoryRequest) => {
        setLoading(true);
        addCategory.mutate(values,
            {
                onSuccess: () => context.closeModal(id),
                onSettled: () => {
                    addCategory.reset();
                    setLoading(false);
                }
            }
        );
    }

    return <form onSubmit={form.onSubmit(handleSubmit)}>
        <CategoryForm form={form} modal={true} is_expense={is_expense} />
        <Button mt='lg' fullWidth type="submit"
            loading={loading}>
            create
        </Button>
    </form>
}

export const openCategoryModal = async (props: OpenContextModal<CategoryModalProps>) => {
    openContextModal({
        ...{
            modal: 'category',
            title: `new ${props.innerProps.is_expense ? 'expense' : 'income'} category`,
            size: 'lg'
        },
        ...props,
        innerProps: props.innerProps
    })
}