import { Blockquote, Tabs } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { TbInfoCircle, TbTimeline } from "react-icons/tb";
import { getAxiosData } from "../query";
import { LineSkeleton } from "./ExpIncLine";
import { NivoShell } from "./Nivo";
import { YearExtremaLine } from "./YearExtremaLine";

export const AllTime = ({ currency_id }: { currency_id: string | null }) => {

    // Fetch earliest date from dataset
    const { data: dateData } = useQuery({
        queryKey: ["transactions", "earliest-date"],
        queryFn: () => getAxiosData("/api/transactions/earliest-date")
    });

    // All-time: from earliest date in dataset to today
    const start = dateData?.date ? DateTime.fromISO(dateData.date) : DateTime.fromISO('2000-01-01');
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
            <Blockquote color="violet" icon={<TbInfoCircle />} style={{ fontSize: '0.9rem' }}>
                <strong>Warning:</strong> the starting saldos might be wrong in this plot. Do not gamble your life savings based on this plot, it needs to be fixed.
            </Blockquote>
            <NivoShell
                nivo={YearExtremaLine} skeleton={LineSkeleton}
                height={400}
                {...commonProps}
            />
        </Tabs.Panel>
    </Tabs>
}
