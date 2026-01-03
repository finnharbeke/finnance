import { Tabs } from "@mantine/core";
import { TbTimeline } from "react-icons/tb";
import { DateTime } from "luxon";
import { useCurrency } from "../types/Currency";
import { YearMinLine } from "./YearMinLine";
import { LineSkeleton } from "./ExpIncLine";
import { NivoShell } from "./Nivo";

export const AllTime = ({ currency_id }: { currency_id: string | null }) => {
    const currency = useCurrency(currency_id ?? '');

    // All-time: from a very early date to today
    const start = DateTime.fromISO('2000-01-01');
    const end = DateTime.now();

    const commonProps = {
        currency_id: currency_id,
        min_date: start,
        max_date: end
    }

    return <Tabs defaultValue='yearminline'>
        <Tabs.List justify='flex-end'>
            <Tabs.Tab value='yearminline' leftSection={<TbTimeline size='1.5rem' />} />
        </Tabs.List>
        <Tabs.Panel value='yearminline'>
            <NivoShell
                nivo={YearMinLine} skeleton={LineSkeleton}
                height={400}
                {...commonProps}
            />
        </Tabs.Panel>
    </Tabs>
}
