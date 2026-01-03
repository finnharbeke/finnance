import { MinimumBalanceLine } from "./MinimumBalanceLine";
import { NivoComponentProps } from "./Nivo";

export const MonthMinLine = (props: NivoComponentProps) => {
    return <MinimumBalanceLine 
        {...props}
        timescale="month"
        endpoint="monthminline"
        label="Monthly\nminimum"
        dateFormat="MMM yy"
    />
}
