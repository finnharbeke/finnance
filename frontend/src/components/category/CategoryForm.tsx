import { Center, ColorInput, Grid, Group, Input, Switch, Text, TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { TbCircleCheck, TbLock } from "react-icons/tb";
import useIsPhone from "../../hooks/useIsPhone";
import { CategoryFormValues, CategoryTransform, useCategories } from "../../types/Category";
import Placeholder from "../Placeholder";
import CategoryInput from "../input/CategoryInput";

interface CategoryFormProps {
    form: UseFormReturnType<CategoryFormValues, CategoryTransform>
    modal: boolean
    is_expense: boolean
}

export default function CategoryForm({ is_expense, form, modal }: CategoryFormProps) {
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