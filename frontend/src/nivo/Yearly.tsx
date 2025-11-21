import { ActionIcon, Group, Popover, SimpleGrid, Switch, Tabs, Text, Title } from "@mantine/core";
import { YearPicker } from "@mantine/dates";
import { DateTime, Duration } from "luxon";
import { useCallback, useState } from "react";
import { TbCalendar, TbChartBar, TbChartLine, TbChevronLeft, TbChevronRight, TbList } from "react-icons/tb";
import useIsPhone from "../hooks/useIsPhone";
import { CategoryPills } from "./CategoryPills";
import { DivBars, DivBarsSkeleton } from "./DivBars";
import { ExpIncLine, LineSkeleton } from "./ExpIncLine";
import { BalanceLine} from "./BalanceLine";
import { NivoShell } from "./Nivo";

export const Yearly = ({ currency_id }: { currency_id: string | null }) => {

    const isPhone = useIsPhone();
    const [popover, setPopover] = useState(false);

    const [year, setYear] = useState(new Date());
    const [last12, setLast12] = useState(false);

    const start = last12 ?
        DateTime.now().startOf('month').minus(Duration.fromObject({
            months: 11
        }))
        :
        DateTime.fromJSDate(year).startOf('year');
    const end = last12 || start.year === DateTime.now().year ?
        DateTime.now() : DateTime.fromJSDate(year).endOf('year');

    const commonProps = {
        currency_id: currency_id,
        min_date: start,
        max_date: end
    }

    const move = useCallback((dir: 'l' | 'r') =>
        !last12 && (dir !== 'r' ||
            !start.equals(DateTime.now().startOf('year')))
        &&
        setYear(
            DateTime.fromJSDate(year).plus(Duration.fromObject({
                years: dir === 'l' ? -1 : 1
            })).toJSDate()
        ), [setYear, year, start, last12]);

    return <>
        <Group justify='space-between'>
            <Title>{
                last12 ? 'last 12 months' : DateTime.fromJSDate(year).toFormat('yyyy')
            }</Title>
            <Group gap='sm' wrap='nowrap' ml='auto'>
                <ActionIcon onClick={() => move('l')}
                    size={isPhone ? 'xl' : 'lg'}
                    variant='default'
                    disabled={last12}>
                    <TbChevronLeft size={isPhone ? '1.5rem' : '1.3rem'} />
                </ActionIcon>
                <Popover opened={popover} onChange={setPopover}>
                    <Popover.Target>
                        <ActionIcon disabled={last12}
                            onClick={() => setPopover(!popover)} size={isPhone ? 'xl' : 'lg'}
                            variant='default'>
                            {/* <TbCalendar size={isPhone ? '1.5rem' : '1.3rem'} /> */}
                            <Text fz='xs'>
                                {DateTime.fromJSDate(year).toFormat('yyyy')}
                            </Text>
                        </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                        <YearPicker maxDate={new Date()}
                            value={year} onChange={v => {
                                v && setYear(v)
                                setPopover(false);
                            }} />
                    </Popover.Dropdown>
                </Popover>
                <ActionIcon onClick={() => move('r')} size={isPhone ? 'xl' : 'lg'}
                    disabled={last12 || start.equals(DateTime.now().startOf('year'))}
                    variant='default'>
                    <TbChevronRight size={isPhone ? '1.5rem' : '1.3rem'} />
                </ActionIcon>
                <Switch size='xl'
                    checked={last12}
                    onChange={(event) => setLast12(event.currentTarget.checked)}
                    thumbIcon={
                        last12 ? <Text fw='bold' c='dark'>12</Text> :  <TbCalendar size={16} />
                    }
                />
            </Group>
        </Group>
        <Tabs defaultValue='divbars'>
            <Tabs.List justify='flex-end'>
                <Tabs.Tab value='divbars' leftSection={<TbChartBar size='1.5rem' />} />
                <Tabs.Tab value='expincline' leftSection={<TbChartLine size='1.5rem' />} />
                <Tabs.Tab value='list' leftSection={<TbList size='1.5rem' />} />
            </Tabs.List>
            <Tabs.Panel value='divbars'>
                <SimpleGrid cols={2} mb='xs'>
                    <Title order={3} ta='center'>expenses</Title>
                    <Title order={3} ta='center'>income</Title>
                </SimpleGrid>
                <NivoShell
                    nivo={DivBars} skeleton={DivBarsSkeleton}
                    {...commonProps}
                />
            </Tabs.Panel>
            <Tabs.Panel value='expincline'>
                <NivoShell
                    nivo={ExpIncLine} skeleton={LineSkeleton}
                    height={300}
                    {...commonProps}
                />
            </Tabs.Panel>
            <Tabs.Panel value='list'>
                <NivoShell
                    nivo={CategoryPills} skeleton={LineSkeleton}
                    is_expense={true}
                    {...commonProps}
                />
                <NivoShell
                    nivo={CategoryPills} skeleton={LineSkeleton}
                    is_expense={false}
                    {...commonProps}
                />
            </Tabs.Panel>
            <Tabs.Panel value='balanceline'>
                <NivoShell
                    nivo={BalanceLine} skeleton={LineSkeleton}
                    height={300}
                    {...commonProps}
                />
            </Tabs.Panel>
        </Tabs>
    </>
}