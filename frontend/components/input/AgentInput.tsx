import { Autocomplete, AutocompleteProps } from "@mantine/core";
import Placeholder from "../Placeholder";
import { useAgents } from "../../types/Agent";

const AgentInput = (props: Omit<AutocompleteProps, 'data'>) => {
    const query = useAgents();

    if (!query.isSuccess)
        return <Placeholder height={30} queries={[query]} />

    const agents = query.data;

    return <Autocomplete
        placeholder='unimensa'
        data={agents}
        {...props}
    />
}

export default AgentInput;