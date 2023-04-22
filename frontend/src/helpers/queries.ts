import { UseQueryResult } from "@tanstack/react-query"

export const allSuccess = (queries: UseQueryResult[]) =>
    queries.reduce((success, query) => query.isSuccess && success, true)

export const anyError = (queries: UseQueryResult[]) =>
    queries.reduce((error, query) => query.isError || error, false)

export const anyLoading = (queries: UseQueryResult[]) =>
    queries.reduce((loading, query) => query.isLoading || loading, false)