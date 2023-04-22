import { Center, Paper, PaperProps, Skeleton, Stack, Text, Title, createStyles } from "@mantine/core";
import { UseQueryResult } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { allSuccess, anyError } from "../helpers/queries";

interface PlaceholderProps extends PaperProps {
    height?: number
    queries: UseQueryResult<unknown, AxiosError>[]
}

const useStyles = createStyles((theme) => ({
    errorPaper: {
        backgroundColor: theme.fn.rgba(theme.colors.red[9], 0.1),
    }
}));

export default function Placeholder({ height, queries, ...other }: PlaceholderProps) {
    const { classes } = useStyles();
    if (allSuccess(queries))
        return <></>
    if (!height)
        height = 200;

    if (anyError(queries))
        return <Paper style={{ height: height, overflow: 'hidden' }} className={classes.errorPaper}
            p='sm' radius='md' {...other}>
            <Center>
                <Stack>
                    {
                        queries.map((query, ix) =>
                            !query.isError ? <></> :
                                query.error.response ?
                                    <Title order={4} align='center'>
                                        {query.error.response.status}: {query.error.response.statusText}
                                    </Title>
                                    :
                                    <Text align='center'>{query.error.message}</Text>
                        )
                    }
                </Stack>
            </Center>
        </Paper >

    return <Skeleton height={height} />

}
