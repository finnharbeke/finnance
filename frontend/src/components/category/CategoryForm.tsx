import { Center, ColorInput, Grid, Group, Input, Switch, Text, TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { TbCircleCheck, TbLock } from "react-icons/tb";
import useIsPhone from "../../hooks/useIsPhone";
import { CategoryFormValues, CategoryTransform } from "../../types/Category";
import CategoryInput from "../input/CategoryInput";

interface CategoryFormProps {
    form: UseFormReturnType<CategoryFormValues, CategoryTransform>
    modal: boolean
    is_expense: boolean
    parent_except?: string
}

export default function CategoryForm({ is_expense, form, modal, parent_except }: CategoryFormProps) {
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
            <Grid.Col span={{sm:4, xs:12}}>
                <ColorInput
                    disallowInput={isPhone}
                    label="color" withAsterisk={modal}
                    {...form.getInputProps('color')}
                />
            </Grid.Col>
            <Grid.Col span={{sm:4, xs:12}}>
                <CategoryInput label="parent category" is_expense={is_expense}
                    placeholder="select parent" must_be_usable={false}
                    except={parent_except}
                    {...form.getInputProps('parent_id')}
                />
            </Grid.Col>
            <Grid.Col span={{sm:4, xs:12}}>
                <Input.Wrapper label='lock for records?'>
                    <Center>
                        <Switch color='red'
                            onLabel={
                                <Group wrap='nowrap' gap='xs'>
                                    <TbLock size={20} />
                                    <Text>locked</Text>
                                </Group>
                            } offLabel={
                                <Group wrap='nowrap' gap='xs'>
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