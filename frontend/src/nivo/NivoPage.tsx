
import { ActionIcon, Grid, Group, Popover, Stack, Tabs, Title } from "@mantine/core";
import { MonthPicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure, useElementSize } from "@mantine/hooks";
import { DateTime, Duration } from "luxon";
import { useCallback } from "react";
import { TbCalendar, TbChartBar, TbChartDonut4, TbChevronLeft, TbChevronRight } from "react-icons/tb";
import CurrencyInput from "../components/input/CurrencyInput";
import { FinnanceBars } from "./Bars";
import FinnanceSunburst from "./Sunburst";
import useIsPhone from "../hooks/useIsPhone";

interface FormValues {
    currency_id: string
    month: Date
}

export default function NivoPage() {
    const { ref: ref1, width: width1 } = useElementSize();
    const { ref: ref2, width: width2 } = useElementSize();

    const isPhone = useIsPhone();
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

    return <Stack>
        <Group>
            <Title>
                analytics
            </Title>
            <Group spacing='sm' noWrap position='right' ml='auto'>
                <ActionIcon onClick={() => move('l')} size={isPhone ? 'xl' : 'lg'}
                    variant='default'>
                    <TbChevronLeft size={isPhone ? '1.5rem' : '1.3rem'} />
                </ActionIcon>
                <Popover opened={opened} onChange={toggle}>
                    <Popover.Target>
                        <ActionIcon onClick={open} size={isPhone ? 'xl' : 'lg'}
                            variant='default'>
                            <TbCalendar size={isPhone ? '1.5rem' : '1.3rem'} />
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
                <ActionIcon onClick={() => move('r')} size={isPhone ? 'xl' : 'lg'}
                    disabled={DateTime.fromJSDate(form.values.month).startOf('month')
                        .equals(DateTime.now().startOf('month'))}
                    variant='default'>
                    <TbChevronRight size={isPhone ? '1.5rem' : '1.3rem'} />
                </ActionIcon>
                <CurrencyInput hasDefault {...form.getInputProps('currency_id')}
                    maw={100}
                />
            </Group>
        </Group>
        <Title align='center'>{
            DateTime.fromJSDate(form.values.month)
                .toFormat('MMMM yy').toLowerCase()
        }</Title>
        <Tabs defaultValue='sunburst'>
            <Tabs.List position='right'>
                <Tabs.Tab value='sunburst' icon={<TbChartDonut4 size='1.5rem' />} />
                <Tabs.Tab value='bars' icon={<TbChartBar size='1.5rem' />} />
                {/* <Tabs.Tab value='list' icon={<TbList size='1.5rem' />} /> */}
            </Tabs.List>
            <Tabs.Panel value='sunburst'>
                <Grid align='flex-end' gutter={'xs'}>


                    <Grid.Col ref={ref1} span={12} sm={7} order={1}>
                        <Title order={3} align='center'>expenses</Title>
                    </Grid.Col>
                    <Grid.Col ref={ref2} span={12} sm={5} orderSm={2} order={4}>
                        <Title order={3} align='center'>income</Title>
                    </Grid.Col>
                    <Grid.Col span={12} sm={7} order={2} orderSm={3}>
                        <FinnanceSunburst size={Math.min(width1, 500)} currency_id={form.values.currency_id}
                            min_date={DateTime.fromJSDate(form.values.month).startOf('month')}
                            max_date={DateTime.fromJSDate(form.values.month).endOf('month')}
                            is_expense={true}
                        />
                    </Grid.Col>
                    <Grid.Col span={12} sm={5} order={5} orderSm={4}>
                        <FinnanceSunburst size={Math.min(width2, 500)} currency_id={form.values.currency_id}
                            min_date={DateTime.fromJSDate(form.values.month).startOf('month')}
                            max_date={DateTime.fromJSDate(form.values.month).endOf('month')}
                            is_expense={false}
                        />
                    </Grid.Col>
                </Grid>
            </Tabs.Panel>
            <Tabs.Panel value='bars'>
                <Stack>
                    <Title order={3} align='center'>expenses</Title>
                    <FinnanceBars currency_id={form.values.currency_id}
                        min_date={DateTime.fromJSDate(form.values.month).startOf('month')}
                        max_date={DateTime.fromJSDate(form.values.month).endOf('month')}
                        is_expense={true}
                    />
                    <Title order={3} align='center'>income</Title>
                    <FinnanceBars currency_id={form.values.currency_id}
                        min_date={DateTime.fromJSDate(form.values.month).startOf('month')}
                        max_date={DateTime.fromJSDate(form.values.month).endOf('month')}
                        is_expense={false}
                    />
                </Stack>
            </Tabs.Panel>
            {/* <Tabs.Panel value='list'>
                hey
            </Tabs.Panel> */}
        </Tabs>
    </Stack>
}