import { Skeleton } from "@mantine/core";
import { ErrorResponse, isRouteErrorResponse } from "@remix-run/router";
import { useEffect } from "react";
import { Outlet, useRouteError } from "react-router";
import useErrorHandler from "../hooks/useErrorHandler";
import BackButton from "./BackButton";

export default function LoaderError() {
    const err = useRouteError();
    const { responseError, handleFetchErrors } = useErrorHandler();
    const handleLoaderErrors = (err: unknown) => {
        if (isRouteErrorResponse(err)) {
            responseError({
                status: err.status,
                name: err.statusText,
                msg: err.data,
            })
        } else {
            handleFetchErrors((err as Error))
        }
    }
    useEffect(() => handleLoaderErrors(err), []);
    return <>
        <BackButton/>
    </>
}