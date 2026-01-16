import { ActionIcon, Grid, Group, Popover, Stack, Tabs, Title } from "@mantine/core";
import { MonthPicker } from "@mantine/dates";
import { useElementSize } from "@mantine/hooks";
import { DateTime, Duration } from "luxon";
import { useCallback, useState } from "react";
import { TbCalendar, TbChartBar, TbChartDonut4, TbChevronLeft, TbChevronRight, TbList } from "react-icons/tb";
import useIsPhone from "../hooks/useIsPhone";
import { BarsSkeleton, FinnanceBars } from "./Bars";
import { NivoShell } from "./Nivo";
import { Sunburst, SunburstSkeleton } from "./Sunburst";
import { CategoryPills } from "./CategoryPills";
import { LineSkeleton } from "./ExpIncLine";

export const Monthly = ({ currency_id }: { currency_id: string | null }) => {

    const isPhone = useIsPhone();
    const [popover, setPopover] = useState(false);

    const [month, setMonth] = useState(new Date());

    const start = DateTime.fromJSDate(month).startOf('month');
    const end = DateTime.fromJSDate(month).endOf('month');
    const commonProps = {
        currency_id: currency_id,
        min_date: start,
        max_date: end
    }

    const move = useCallback((dir: 'l' | 'r') =>
        (dir !== 'r' ||
            !start.equals(DateTime.now().startOf('month')))
        &&
        setMonth(
            DateTime.fromJSDate(month).plus(Duration.fromObject({
                months: dir === 'l' ? -1 : 1
            })).toJSDate()
        ), [setMonth, month, start]);

    const { ref: ref1, width: width1 } = useElementSize();
    const { ref: ref2, width: width2 } = useElementSize();

    return <>
        <Group justify='space-between'>
            <Title>{
                DateTime.fromJSDate(month)
                    .toFormat('MMMM yy').toLowerCase()
            }</Title>
            <Group gap='sm' wrap='nowrap' ml='auto'>
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
                            value={month} onChange={v => {
                                v && setMonth(v)
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
            <Tabs.List justify='flex-end'>
                <Tabs.Tab value='sunburst' leftSection={<TbChartDonut4 size='1.5rem' />} />
                <Tabs.Tab value='bars' leftSection={<TbChartBar size='1.5rem' />} />
                <Tabs.Tab value='list' leftSection={<TbList size='1.5rem' />} />
            </Tabs.List>
            <Tabs.Panel value='sunburst'>
                <Grid align='flex-end' gutter={'xs'}>


                    <Grid.Col ref={ref1} span={{base: 12, sm: 7}} order={1}>
                        <Title order={3} ta='center'>expenses</Title>
                    </Grid.Col>
                    <Grid.Col ref={ref2} span={{base: 12, sm: 5}} order={{base: 4, sm: 2}}>
                        <Title order={3} ta='center'>income</Title>
                    </Grid.Col>
                    <Grid.Col span={{base: 12, sm: 7}} order={{base: 2, sm: 3}}>
                        <NivoShell
                            nivo={Sunburst} skeleton={SunburstSkeleton}
                            height={Math.min(width1, 500)}
                            {...commonProps}
                            is_expense={true}
                        />
                    </Grid.Col>
                    <Grid.Col span={{base: 12, sm: 5}} order={{base: 5, sm: 4}}>
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
                    <Title order={3} ta='center'>expenses</Title>
                    <NivoShell
                        nivo={FinnanceBars} skeleton={BarsSkeleton}
                        {...commonProps}
                        is_expense={true}
                    />
                    <Title order={3} ta='center'>income</Title>
                    <NivoShell
                        nivo={FinnanceBars} skeleton={BarsSkeleton}
                        {...commonProps}
                        is_expense={false}
                    />
                </Stack>
            </Tabs.Panel>
            <Tabs.Panel value='list'>
                <NivoShell
                    nivo={CategoryPills} skeleton={LineSkeleton}
                    {...commonProps}
                    is_expense={true}
                />
                <NivoShell
                    nivo={CategoryPills} skeleton={LineSkeleton}
                    {...commonProps}
                    is_expense={false}
                />
            </Tabs.Panel>
        </Tabs>
    </>
}