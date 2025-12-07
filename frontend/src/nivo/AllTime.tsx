import { Stack } from "@mantine/core";
import { DateTime } from "luxon";
import { useCurrency } from "../types/Currency";
import { YearlyMinimumLine } from "./YearlyMinimumLine";
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

    return <Stack>
        <NivoShell
            nivo={YearlyMinimumLine} skeleton={LineSkeleton}
            height={400}
            {...commonProps}
        />
    </Stack>
}
