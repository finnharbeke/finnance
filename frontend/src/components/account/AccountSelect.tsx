import { Select, SelectProps } from "@mantine/core";
import { useAccounts } from "../../hooks/api/useQuery";
import useIsPhone from "../../hooks/useIsPhone";
import Placeholder from "../Placeholder";

export default function AccountSelect(props: Partial<SelectProps>) {
    const query = useAccounts();
    const isPhone = useIsPhone();

    if (!query.isSuccess)
        return <Placeholder height={50} queries={[query]} />
    const accounts = query.data;
    return <Select withAsterisk placeholder="select account"
        searchable={!isPhone} label="account"
        data={accounts.map(
            acc => ({
                value: acc.id.toString(),
                label: acc.desc
            })
        )}
        {...props}
    />
}