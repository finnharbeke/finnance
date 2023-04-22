import { Skeleton } from "@mantine/core";
import { DateTime } from "luxon";
import { useChanges } from "../../hooks/api/useQuery";
import { AccountChange, isAccountChangeTransaction } from "../../Types/AccountChange";
import { TransactionHead } from "../Transaction";
import { TransferHead } from "../transfer/Transfer";

interface AccountChangesProps {
    id: number,
    start?: DateTime,
    end?: DateTime,
    n: number,
}

export function AccountChanges(props: AccountChangesProps) {
    const { id, start, end, n } = props;

    const { data, isLoading } = useChanges(id, { start, end, n });

    return <>
        {
            isLoading ?
                <Skeleton height={200} />
                :
                data?.map((change: AccountChange, ix: number) => (
                    isAccountChangeTransaction(change) ?
                        <TransactionHead {...change} key={ix} />
                        :
                        <TransferHead {...change} key={ix} />
                ))
        }
    </>
}