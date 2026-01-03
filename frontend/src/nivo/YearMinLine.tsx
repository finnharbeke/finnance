import { MinimumBalanceLine } from "./MinimumBalanceLine";
import { NivoComponentProps } from "./Nivo";

export const YearMinLine = (props: NivoComponentProps) => {
    return <MinimumBalanceLine 
        {...props}
        timescale="year"
        endpoint="yearminline"
        label="Yearly\nminimum"
        dateFormat="yyyy"
    />
}

