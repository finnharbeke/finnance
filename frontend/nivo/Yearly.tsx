import { ActionIcon, Center, Checkbox, Group, Popover, SimpleGrid, Tabs, Text, Title } from "@mantine/core";
import { YearPicker } from "@mantine/dates";
import { DateTime, Duration } from "luxon";
import { useCallback, useState } from "react";
import { TbChartBar, TbChartLine, TbChevronLeft, TbChevronRight, TbList } from "react-icons/tb";
import useIsPhone from "../hooks/useIsPhone";
import { DivBars, DivBarsSkeleton } from "./DivBars";
import { Line, LineSkeleton } from "./Line";
import { NivoShell } from "./Nivo";
import { CategoryPills } from "./CategoryPills";

export const Yearly = ({ currency_id }: { currency_id: string | null }) => {

    const isPhone = useIsPhone();
    const [popover, setPopover] = useState(false);

    const [year, setYear] = useState(new Date());
    const [last12, setLast12] = useState(true);

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
        <Group position='apart'>
            <Title>{
                last12 ? 'last 12 months' : DateTime.fromJSDate(year).toFormat('yyyy')
            }</Title>
            <Group spacing='sm' noWrap ml='auto'>
                <ActionIcon onClick={() => move('l')}
                    size={isPhone ? 'xl' : 'lg'}
                    variant='default'
                    disabled={last12}>
                    <TbChevronLeft size={isPhone ? '1.5rem' : '1.3rem'} />
                </ActionIcon>
                <Popover opened={popover} onChange={setPopover}>
                    <Popover.Target>
                        <ActionIcon onClick={() => setPopover(!popover)} size={isPhone ? 'xl' : 'lg'}
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
                <Checkbox size='xl'
                    checked={last12}
                    onChange={(event) => setLast12(event.currentTarget.checked)}
                    icon={({className}) => <Center className={className}>
                        <Text fw='bold'>12</Text>
                        </Center>}
                        
                    indeterminate
                />
            </Group>
        </Group>
        <Tabs defaultValue='divbars'>
            <Tabs.List position='right'>
                <Tabs.Tab value='divbars' icon={<TbChartBar size='1.5rem' />} />
                <Tabs.Tab value='line' icon={<TbChartLine size='1.5rem' />} />
                <Tabs.Tab value='list' icon={<TbList size='1.5rem' />} />
            </Tabs.List>
            <Tabs.Panel value='divbars'>
                <SimpleGrid cols={2} mb='xs'>
                    <Title order={3} align='center'>expenses</Title>
                    <Title order={3} align='center'>income</Title>
                </SimpleGrid>
                <NivoShell
                    nivo={DivBars} skeleton={DivBarsSkeleton}
                    {...commonProps}
                />
            </Tabs.Panel>
            <Tabs.Panel value='line'>
                <NivoShell
                    nivo={Line} skeleton={LineSkeleton}
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
        </Tabs>
    </>
}