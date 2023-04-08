import { Button, Center, Collapse, ColorInput, ColorSwatch, Flex, Grid, Group, Input, Paper, Select, Switch, Text, TextInput, Title } from "@mantine/core";
import { UseFormReturnType, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { createContext, useContext, useEffect, useState } from "react";
import { TbChevronDown, TbChevronRight, TbChevronUp, TbCircleCheck, TbDeviceFloppy, TbLock, TbRotate2 } from "react-icons/tb";
import { CategoryFlat } from "../Types/Category";
import { PrimaryIcon, RedIcon, SecondaryIcon } from "../components/Inputs/Icons";
import { OrderFormContextType, OrderFormValues, largestOrder, lastOrder, leastOrder, nextOrder } from "../components/account/AccountList";
import { useAddCategory, useEditCategory, useEditCategoryOrders } from "../hooks/api/useMutation";
import { useCategories } from "../hooks/api/useQuery";
import useIsPhone from "../hooks/useIsPhone";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { FormValidateInput } from "@mantine/form/lib/types";
import { OpenContextModal } from "@mantine/modals/lib/context";

export const CategoriesPage = () => {

    const { data: categories, isSuccess } = useCategories();

    const isPhone = useIsPhone();

    return <>
        <Title>categories</Title>
        {
            isSuccess &&
            <>
                <CategoryList categories={categories.filter(a => a.is_expense)} title='expenses' />
                <Button fullWidth my='sm'
                    onClick={() => {
                    openCategoryModal({
                        fullScreen: isPhone,
                        innerProps: {
                            is_expense: true,
                            categories: categories.filter(a => a.is_expense)
                        }
                    })
                }}>
                        create expense category
                        </Button>
                <CategoryList categories={categories.filter(a => !a.is_expense)} title='income' />
                <Button fullWidth mt='sm'
                    onClick={() => {
                    openCategoryModal({
                        fullScreen: isPhone,
                        innerProps: {
                            is_expense: false,
                            categories: categories.filter(a => !a.is_expense)
                        }
                    })
                }}>
                        create income category
                        </Button>
            </>
        }
    </>

}

const CategoryListContext = createContext<OrderFormContextType>({
    moveDown: () => { },
    moveUp: () => { },
});

function useCategoryList() {
    return useContext(CategoryListContext);
}

export const CategoryList = ({ categories, title }: { categories: CategoryFlat[], title: string }) => {

    const initials: () => OrderFormValues = () => ({
        orders: categories.sort((a, b) => a.id - b.id).map(a => a.order),
        ids: categories.sort((a, b) => a.id - b.id).map(a => a.id),
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
        { categories.length > 0 ?
        <Grid>{
            categories.sort((a, b) => a.id - b.id).map((cat, ix) =>
            <Grid.Col span={12} key={ix} order={orderForm.values.orders[ix]}>
                    <CategoryEdit ix={ix} category={cat} categories={categories} />
                </Grid.Col>
            )
        }</Grid>
        :
        <Center><Title order={3}>no categories yet</Title></Center>
        }
    </CategoryListContext.Provider>
}

export interface CategoryFormValues {
    desc: string
    color: string
    parent_id: string | undefined
    usable: boolean
}

export interface TransformedCategoryFormValues {
    desc: string
    color: string
    parent_id: number | null
    usable: boolean
}

type Transform = (v: CategoryFormValues) => TransformedCategoryFormValues;

interface CategoryEditProps {
    category: CategoryFlat,
    categories: CategoryFlat[],
    ix: number
}

const validateCategoryForm: FormValidateInput<CategoryFormValues> = {
    desc: (val) => (val && val.length > 0) ? null : "enter category name",
    color: (val) => (val && val.length === 7) ? null : "enter hex color",
}

const categoryFormTransform = (values: CategoryFormValues) => ({
    ...values,
    parent_id: values.parent_id ? parseInt(values.parent_id) : null
})

export const CategoryEdit = ({ category, categories, ix }: CategoryEditProps) => {

    const [open, { toggle }] = useDisclosure(false);

    const initials = () => ({
        desc: category.desc,
        color: category.color,
        parent_id: category.parent_id ? category.parent_id.toString() : undefined,
        usable: category.usable
    })

    const form = useForm<CategoryFormValues, Transform>({
        initialValues: initials(),
        validate: validateCategoryForm,
        transformValues: categoryFormTransform
    });

    const editCategory = useEditCategory();
    const [editing, { open: startEdit, close: endEdit }] = useDisclosure(false);

    const reset = () => {
        form.setValues(initials());
        form.resetDirty(initials());
        // close();
    }

    // disable: missing dependency form, but should only reset
    // on change of data
    // eslint-disable-next-line
    useEffect(reset, [category.desc, category.color, category.usable, category.parent_id])

    const handleSubmit = (values: TransformedCategoryFormValues) => {
        startEdit();
        editCategory.mutate(
            { id: category.id, values },
            {
                onSuccess: () => {
                    editCategory.reset();
                }, onSettled: endEdit
            }
        );
    }

    const isPhone = useIsPhone();
    const { moveUp, moveDown } = useCategoryList();

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
                <CategoryForm form={form} modal={false}
                    categories={categories.filter(c => c.id !== category.id)}/>
            </Collapse>
        </form>
    </Paper>
}

interface CategoryFormProps {
    form: UseFormReturnType<CategoryFormValues, Transform>
    categories: CategoryFlat[]
    modal: boolean
}

const CategoryForm = ({ form, categories, modal }: CategoryFormProps) => {
    const isPhone = useIsPhone();

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
                <Select label="parent category"
                    searchable={!isPhone} clearable
                    placeholder="select parent"
                    data={categories.map(
                        cur => ({
                            value: cur.id.toString(),
                            label: cur.desc,
                        })
                    )}
                    {...form.getInputProps('parent_id')}
                />
            </Grid.Col>
            <Grid.Col sm={4} xs={12}>

                <Input.Wrapper label='lock for records?'>
                    <Center>
                        <Switch size={'xl'} color='red'
                            onLabel={
                                <Group noWrap spacing='xs'>
                                    <TbLock size={20} />
                                    <Text>locked</Text>
                                </Group>
                            } offLabel={
                                <Group noWrap spacing='xs'>
                                    <Text>free to use</Text>
                                    <TbCircleCheck size={20} color='green'/>
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

export interface AddCategoryFormValues extends TransformedCategoryFormValues {
    is_expense: boolean
}

type AddTransform = (v: CategoryFormValues) => AddCategoryFormValues;

interface CategoryModalProps {
    is_expense: boolean
    categories: CategoryFlat[]
}

export const CategoryModal = ({ context, id, innerProps }: ContextModalProps<CategoryModalProps>) => {
    const { categories, is_expense } = innerProps;
    const form = useForm<CategoryFormValues, AddTransform>({
        initialValues: {
            usable: true,
            desc: '',
            parent_id: undefined,
            color: '',
        },
        validate: validateCategoryForm,
        transformValues: (values) => ({
            ...categoryFormTransform(values),
            is_expense: is_expense
        }),
    })

    const [loading, setLoading] = useState(false);
    const addCategory = useAddCategory();

    const handleSubmit = (values: AddCategoryFormValues) => {
        setLoading(true);
        console.log(values);
        addCategory.mutate(values,
            { onSuccess: () => context.closeModal(id),
              onSettled: () => {
                addCategory.reset();
                setLoading(false);
            }}
        );
    }

    return <form onSubmit={form.onSubmit(handleSubmit)}>
        <CategoryForm form={form} categories={categories} modal={true}/>
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