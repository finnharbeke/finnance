import { ExtremaBalanceLine } from "./ExtremaBalanceLine";
import { NivoComponentProps } from "./Nivo";

export const YearExtremaLine = (props: NivoComponentProps) => {
    return <ExtremaBalanceLine 
        {...props}
        timescale="year"
        endpoint="yearminline"
        label="Yearly minimum"
        dateFormat="yyyy"
    />
}

