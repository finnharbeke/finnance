import { Select, SelectProps } from "@mantine/core";
import useIsPhone from "../../hooks/useIsPhone";
import { useAccounts } from "../../types/Account";
import Placeholder from "../Placeholder";

interface AccountSelectProps extends Omit<SelectProps, 'data'> {
    include_remote?: boolean
}

export default function AccountSelect({ include_remote = false, ...props }: AccountSelectProps) {
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
        ).concat(
            include_remote ? [{ value: 'remote', label: '👽 remote transaction' }] : []
        )}
        {...props}
    />
}