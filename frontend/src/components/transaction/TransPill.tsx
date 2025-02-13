import { Center, Loader, Title, useMantineTheme } from "@mantine/core";
import { DateTime } from "luxon";
import { TbMinus, TbPlus } from "react-icons/tb";
import { editTransactionAction } from "../../actions/actions";
import useAmount from "../../hooks/useAmount";
import { useCurrency } from "../../types/Currency";
import { TransactionDeepQueryResult, useTransactions, useTransactionsProps } from "../../types/Transaction";
import { TwoLabelPill } from "../DataPill";
import { FilterPagination, useFilterPagination } from "../Filter";
import Placeholder from "../Placeholder";

export function FilterableTransactions(props: Partial<useTransactionsProps>) {
    const [filter, setFilter] = useFilterPagination();
    const query = useTransactions({ ...filter, ...props });

    if (query.isError)
        return <Placeholder height={300} queries={[query]} />

    return <>
        <TransPills transactions={query.data?.transactions} />
        <FilterPagination filter={filter} setFilter={setFilter} pages={query.data?.pages} />
    </>
}

export const TransPills = ({ transactions }: { transactions: TransactionDeepQueryResult[] | undefined }) => {
    if (transactions === undefined)
        return <Center><Loader /></Center>
    return transactions.length > 0 ?
        <>{
            transactions.map((t, ix) =>
                <TransPill trans={t} key={ix} />
            )
        }</>
        :
        <Title order={4} ta='center'>no transactions found</Title>
}

const TransPill = ({ trans }: { trans: TransactionDeepQueryResult }) => {
    const query = useCurrency(trans.currency_id);
    const theme = useMantineTheme();

    const amount = useAmount(trans.amount, query.data);

    if (!query.isSuccess)
        return <Placeholder height={40} queries={[query]} />

    return <TwoLabelPill {...{
        icon: trans.is_expense ? TbMinus : TbPlus,
        iconColor: trans.is_expense ? 'red' : 'blue',
        datetime: DateTime.fromISO(trans.date_issued),
        amount,
        is_expense: trans.is_expense,
        label: {
            text: trans.agent.desc
        },
        label2: {
            text: trans.account_id !== null ?
                trans.account.desc : trans.flows[0].agent_desc,
            color: trans.account_id === null ? theme.other.colors.transfer : theme.primaryColor,
            link: trans.account_id === null ? undefined : `/accounts/${trans.account_id}`,
        },
        onEdit: () => editTransactionAction(trans.id),
        comment: trans.comment
    }} />
}