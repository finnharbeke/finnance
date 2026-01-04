import { ExtremaBalanceLine } from "./ExtremaBalanceLine";
import { NivoComponentProps } from "./Nivo";

export const MonthExtremaLine = (props: NivoComponentProps) => {
    return <ExtremaBalanceLine 
        {...props}
        timescale="month"
        endpoint="monthminline"
        label="Monthly"
        dateFormat="MMM yy"
    />
}
