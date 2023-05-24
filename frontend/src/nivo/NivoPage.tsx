
import { ActionIcon, Group, Popover, SimpleGrid, Stack, Title } from "@mantine/core";
import { MonthPicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure, useElementSize } from "@mantine/hooks";
import { DateTime, Duration } from "luxon";
import { useCallback } from "react";
import { TbCalendar, TbChevronLeft, TbChevronRight } from "react-icons/tb";
import CurrencyInput from "../components/input/CurrencyInput";
import FinnanceSunburst from "./Sunburst";

interface FormValues {
    currency_id: string
    month: Date
}

export default function NivoPage() {
    const { ref, width } = useElementSize();

    const [opened, { open, close, toggle }] = useDisclosure();

    const form = useForm<FormValues>({
        initialValues: {
            currency_id: '',
            month: new Date(),
        }
    })

    const move = useCallback((dir: 'l' | 'r') =>
        (dir !== 'r' ||
            !DateTime.fromJSDate(form.values.month).startOf('month')
                .equals(DateTime.now().startOf('month')))
        &&
        form.setFieldValue('month',
            DateTime.fromJSDate(form.values.month).plus(Duration.fromObject({
                months: dir === 'l' ? -1 : 1
            })).toJSDate()
        ), [form]);

    return <Stack ref={ref}>
        <Group spacing='sm'>
            <Title>
                analytics
            </Title>
            <ActionIcon onClick={() => move('l')}
                variant='default' ml='auto'>
                <TbChevronLeft size='1.2rem' />
            </ActionIcon>
            <Popover opened={opened} onChange={toggle}>
                <Popover.Target>
                    <ActionIcon onClick={open}
                        variant='default'>
                        <TbCalendar size='1.2rem' />
                    </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown>
                    <MonthPicker maxDate={new Date()}
                        value={form.values.month} onChange={v => {
                            v && form.setFieldValue('month', v)
                            close();
                        }} />
                </Popover.Dropdown>
            </Popover>
            <ActionIcon onClick={() => move('r')}
                disabled={DateTime.fromJSDate(form.values.month).startOf('month')
                    .equals(DateTime.now().startOf('month'))}
                variant='default'>
                <TbChevronRight size='1.2rem' />
            </ActionIcon>
            <CurrencyInput hasDefault {...form.getInputProps('currency_id')}
                maw={100}
            />
        </Group>
        <Title align='center'>{
            DateTime.fromJSDate(form.values.month)
                .toFormat('MMMM yy').toLowerCase()
        }</Title>
        <SimpleGrid cols={2}>
            <FinnanceSunburst size={Math.min(width, 500)} currency_id={form.values.currency_id}
                min_date={DateTime.fromJSDate(form.values.month).startOf('month')}
                max_date={DateTime.fromJSDate(form.values.month).endOf('month')}
            />
            <FinnanceSunburst size={Math.min(width, 500)} currency_id={form.values.currency_id}
                min_date={DateTime.fromJSDate(form.values.month).startOf('month')}
                max_date={DateTime.fromJSDate(form.values.month).endOf('month')}
                is_expense={false}
            />
        </SimpleGrid>
    </Stack>
}