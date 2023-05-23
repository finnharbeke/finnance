import { Center, Loader, Title, useMantineTheme } from "@mantine/core";
import { DateTime } from "luxon";
import { TbArrowsLeftRight, TbMinus, TbPlus } from "react-icons/tb";
import { editTransactionAction, editTransferAction } from "../../actions/actions";
import useAmount from "../../hooks/useAmount";
import { Change, isChangeTransaction, useAccount, useChanges } from "../../types/Account";
import { SaldoPill } from "../DataPill";
import { FilterPagination, useFilterPagination } from "../Filter";
import Placeholder from "../Placeholder";

export function ChangePills({ changes }: { changes: Change[] | undefined }) {
    if (changes === undefined)
        return <Center><Loader /></Center>
    return changes.length > 0 ?
        <>{
            changes.map((change, ix) =>
                <ChangePill change={change} key={ix} />
            )
        }</>
        :
        <Title order={4} align='center'>no changes found</Title>
}

export function FilterableChanges({ id }: { id: number }) {
    const [filter, setFilter] = useFilterPagination();
    const query = useChanges(id, filter);

    if (query.isError)
        return <Placeholder height={300} queries={[query]} />

    return <>
        <ChangePills changes={query.data?.changes} />
        <FilterPagination filter={filter} setFilter={setFilter} pages={query.data?.pages} />
    </>
}

const ChangePill = ({ change }: { change: Change }) => {
    const theme = useMantineTheme();

    const query = useAccount(change.acc_id);
    const isTransfer = !isChangeTransaction(change);
    const isSource = isTransfer && change.data.src_id === change.acc_id;
    const isExpense = (!isTransfer && change.data.is_expense) || isSource;

    const amount = useAmount(isTransfer ?
        isSource ? change.data.src_amount : change.data.dst_amount
        : change.data.amount, query.data?.currency)

    const saldo = useAmount(change.saldo, query.data?.currency);

    if (!query.isSuccess)
        return <Placeholder height={30} queries={[query]} />

    return <SaldoPill {...{
        icon: isTransfer ? TbArrowsLeftRight :
            isExpense ?
                TbMinus : TbPlus,
        iconColor: theme.other.colors[
            isTransfer ? 'transfer'
                : isExpense ? 'expense' : 'income'
        ],
        datetime: DateTime.fromISO(change.data.date_issued),
        amount, is_expense: isExpense, saldo,
        label: {
            text: change.target,
            link: isTransfer ? `/accounts/${isSource ? change.data.dst_id : change.data.src_id}` : undefined,
            color: isTransfer ? theme.primaryColor : undefined
        },
        comment: change.data.comment,
        onEdit: () => isTransfer ?
            editTransferAction(change.data)
            :
            editTransactionAction(change.data.id),
    }} />
}