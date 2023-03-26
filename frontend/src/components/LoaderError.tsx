import { useEffect } from "react";
import { useRouteError } from "react-router";
import useErrorHandler from "../hooks/useErrorHandler";
import { ReloadButton } from "./NavButtons";

export default function LoaderError() {
    const err = useRouteError();
    const { handleErrors } = useErrorHandler();

    useEffect(() => handleErrors(err), [err, handleErrors]);
    return <>
        <ReloadButton/>
    </>
}