import { Center, Paper, PaperProps, Skeleton, Stack, Text, Title, createStyles } from "@mantine/core";
import { UseQueryResult } from "@tanstack/react-query";
import { AxiosError } from "axios";

const anyError = (queries: UseQueryResult[]) =>
    queries.reduce((error, query) => query.isError || error, false)

const useStyles = createStyles((theme) => ({
    errorPaper: {
        backgroundColor: theme.fn.rgba(theme.colors.red[9], 0.1),
    }
}));

interface PlaceholderProps extends PaperProps {
    height?: number
    queries: UseQueryResult<unknown, AxiosError>[]
}

export default function Placeholder({ height=200, queries, ...other }: PlaceholderProps) {
    const { classes } = useStyles();

    if (anyError(queries))
        return <Paper style={{ height: height, overflow: 'hidden' }} className={classes.errorPaper}
            p='sm' radius='md' {...other}>
            <Center>
                <Stack>
                    {
                        queries.map((query, ix) =>
                            !query.isError ? <></> :
                                query.error.response ?
                                    <Title order={4} align='center' key={ix}>
                                        {query.error.response.status}: {query.error.response.statusText}
                                    </Title>
                                    :
                                    <Text align='center' key={ix}>{query.error.message}</Text>
                        )
                    }
                </Stack>
            </Center>
        </Paper >

    return <Skeleton height={height} />

}
