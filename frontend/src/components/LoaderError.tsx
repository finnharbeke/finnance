import { Skeleton } from "@mantine/core";
import { ErrorResponse, isRouteErrorResponse } from "@remix-run/router";
import { useEffect } from "react";
import { Outlet, useRouteError } from "react-router";
import useErrorHandler from "../hooks/useErrorHandler";
import BackButton from "./BackButton";

export default function LoaderError() {
    const err = useRouteError();
    const { handleErrors } = useErrorHandler();

    useEffect(() => handleErrors(err), []);
    return <>
        <BackButton/>
    </>
}