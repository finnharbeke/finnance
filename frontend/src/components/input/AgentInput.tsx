import { Autocomplete, AutocompleteProps } from "@mantine/core";
import { useAgents } from "../../hooks/api/useQuery";
import Placeholder from "../Placeholder";

const AgentInput = (props: Omit<AutocompleteProps, 'data'>) => {
    const query = useAgents();

    if (!query.isSuccess)
        return <Placeholder height={30} queries={[query]} />

    const agents = query.data;

    return <Autocomplete
        placeholder='unimensa'
        data={agents.map(
            agent => agent.desc
        )}
        {...props}
    />
}

export default AgentInput;