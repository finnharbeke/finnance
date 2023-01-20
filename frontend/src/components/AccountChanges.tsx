import { Anchor, Center, createStyles, Image, Skeleton, Stack, Text } from "@mantine/core";
import * as moment from "moment";
import { useEffect, useState } from "react";
import { throwOrReturnFromResponse } from "../contexts/ErrorHandlerProvider";
import useErrorHandler from "../hooks/useErrorHandler";
import { AccountChange, isAccountChangeTransaction } from "../Types/AccountChange";
import { TransactionHead } from "./Transaction";
import { TransferHead } from "./Transfer";

interface AccountChangesProps {
    id: number,
    start: moment.Moment,
    end: moment.Moment,
}

export function AccountChanges(props: AccountChangesProps) {
    const { id, start, end } = props;
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState(null);
    const { handleErrors } = useErrorHandler();
    useEffect(() => {
        setLoading(true);
        var searchParams = new URLSearchParams();
        const naiveStart = start.toISOString(false).replace('Z', '');
        const naiveEnd = end.toISOString(false).replace('Z', '');
        searchParams.append('start', naiveStart);
        searchParams.append('end', naiveEnd);
        fetch(`/api/accounts/${id}/changes?` + searchParams.toString(), {
            signal: AbortSignal.timeout(3000)
        }).then(throwOrReturnFromResponse)
            .then((data: any) =>
                setItems(data.map((change: AccountChange, ix: number) => {
                    return isAccountChangeTransaction(change) ?
                        <TransactionHead {...change} key={ix}/>
                        :
                        <TransferHead {...change} key={ix}/>
                    }
                ))
            ).catch(handleErrors).finally(() => setLoading(false))
    }, [id, start, end]);

    const useStyles = createStyles((theme) => ({
        opaqueImage: {
            opacity: 0.2,
            filter: theme.colorScheme === 'light' ? '' : 'invert(100%)'
        }
    }))

    const { classes } = useStyles();

    return <Skeleton visible={loading}>
        {(items !== null && items.length !== 0) ? items :
            <Stack>
                <Center>
                    <Image
                        alt="no results"
                        src="/static/no-results.png"
                        caption="No Transactions this Month"
                        width={200}
                        classNames={{
                            imageWrapper: classes.opaqueImage
                        }}
                    />
                </Center>
                <Center mt='xl'>
                    <Anchor fz='xs' href="https://www.flaticon.com/free-icons/no-results" title="no results icons">No results icons created by Freepik - Flaticon</Anchor>
                </Center>
            </Stack>
        }
    </Skeleton>
}