
import { ActionIcon, Grid, Group, Popover, SimpleGrid, Stack, Tabs, Title } from "@mantine/core";
import { MonthPicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useElementSize } from "@mantine/hooks";
import { DateTime, Duration } from "luxon";
import { useCallback, useState } from "react";
import { TbCalendar, TbChartBar, TbChartDonut4, TbChevronLeft, TbChevronRight } from "react-icons/tb";
import CurrencyInput from "../components/input/CurrencyInput";
import useIsPhone from "../hooks/useIsPhone";
import { BarsSkeleton, FinnanceBars } from "./Bars";
import { DivBars, DivBarsSkeleton } from "./DivBars";
import { NivoShell } from "./Nivo";
import { Sunburst, SunburstSkeleton } from "./Sunburst";

interface FormValues {
    currency_id: string | null
    month: Date
}

export default function NivoPage() {
    const { ref: ref1, width: width1 } = useElementSize();
    const { ref: ref2, width: width2 } = useElementSize();

    const isPhone = useIsPhone();
    const [popover, setPopover] = useState(false);

    const form = useForm<FormValues>({
        initialValues: {
            currency_id: null,
            month: new Date(),
        }
    })

    const start = DateTime.fromJSDate(form.values.month).startOf('month');
    const end = DateTime.fromJSDate(form.values.month).endOf('month');
    const commonProps = {
        currency_id: form.values.currency_id,
        min_date: start,
        max_date: end
    }

    const move = useCallback((dir: 'l' | 'r') =>
        (dir !== 'r' ||
            !start.equals(DateTime.now().startOf('month')))
        &&
        form.setFieldValue('month',
            DateTime.fromJSDate(form.values.month).plus(Duration.fromObject({
                months: dir === 'l' ? -1 : 1
            })).toJSDate()
        ), [form, start]);

    return <Stack>
        <Group position='apart'>
            <Title>
                analytics
            </Title>
            <CurrencyInput hasDefault {...form.getInputProps('currency_id')}
                maw={150}
            />
        </Group>
        <Tabs defaultValue={'monthly'}>
            <Tabs.List position='right' mb='sm'>
                <Tabs.Tab value='monthly' icon={<TbCalendar size='1.5rem' />} />
                <Tabs.Tab value='yearly' icon='365' />
            </Tabs.List>
            <Tabs.Panel value='monthly'>
                <Group position='apart'>
                    <Title>{
                        DateTime.fromJSDate(form.values.month)
                            .toFormat('MMMM yy').toLowerCase()
                    }</Title>
                    <Group spacing='sm' noWrap ml='auto'>
                        <ActionIcon onClick={() => move('l')} size={isPhone ? 'xl' : 'lg'}
                            variant='default'>
                            <TbChevronLeft size={isPhone ? '1.5rem' : '1.3rem'} />
                        </ActionIcon>
                        <Popover opened={popover} onChange={setPopover}>
                            <Popover.Target>
                                <ActionIcon onClick={() => setPopover(!popover)} size={isPhone ? 'xl' : 'lg'}
                                    variant='default'>
                                    <TbCalendar size={isPhone ? '1.5rem' : '1.3rem'} />
                                </ActionIcon>
                            </Popover.Target>
                            <Popover.Dropdown>
                                <MonthPicker maxDate={new Date()}
                                    value={form.values.month} onChange={v => {
                                        v && form.setFieldValue('month', v)
                                        setPopover(false);
                                    }} />
                            </Popover.Dropdown>
                        </Popover>
                        <ActionIcon onClick={() => move('r')} size={isPhone ? 'xl' : 'lg'}
                            disabled={start
                                .equals(DateTime.now().startOf('month'))}
                            variant='default'>
                            <TbChevronRight size={isPhone ? '1.5rem' : '1.3rem'} />
                        </ActionIcon>
                    </Group>
                </Group>
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
                                <NivoShell
                                    nivo={Sunburst} skeleton={SunburstSkeleton}
                                    height={Math.min(width1, 500)}
                                    {...commonProps}
                                    is_expense={true}
                                />
                            </Grid.Col>
                            <Grid.Col span={12} sm={5} order={5} orderSm={4}>
                                <NivoShell
                                    nivo={Sunburst} skeleton={SunburstSkeleton}
                                    height={Math.min(width2, 500)}
                                    {...commonProps}
                                    is_expense={false}
                                />
                            </Grid.Col>
                        </Grid>
                    </Tabs.Panel>
                    <Tabs.Panel value='bars'>
                        <Stack>
                            <Title order={3} align='center'>expenses</Title>
                            <NivoShell
                                nivo={FinnanceBars} skeleton={BarsSkeleton}
                                {...commonProps}
                                is_expense={true}
                            />
                            <Title order={3} align='center'>income</Title>
                            <NivoShell
                                nivo={FinnanceBars} skeleton={BarsSkeleton}
                                {...commonProps}
                                is_expense={false}
                            />
                        </Stack>
                    </Tabs.Panel>
                    {/* <Tabs.Panel value='list'>
                hey
            </Tabs.Panel> */}
                </Tabs>
            </Tabs.Panel>
            <Tabs.Panel value='yearly'>
                <SimpleGrid cols={2} mb='xs'>
                    <Title order={3} align='center'>expenses</Title>
                    <Title order={3} align='center'>income</Title>
                </SimpleGrid>
                <NivoShell
                    nivo={DivBars} skeleton={DivBarsSkeleton}
                    {...commonProps}
                    min_date={DateTime.fromJSDate(form.values.month).startOf('month').minus(Duration.fromObject({
                        months: 11
                    }))}
                />
            </Tabs.Panel>
        </Tabs>
    </Stack>
}