import { Modal } from "@mantine/core";
import { useDisclosure, useToggle } from "@mantine/hooks";
import { createContext, ReactNode, useState } from "react";
import { isRouteErrorResponse } from "react-router-dom";
import { FrontendErrorAlert, ServerSideErrorAlert, TimeoutAlert } from "../components/Alerts";

export interface ResponseErrorProps {
    status: number,
    name: string,
    msg: string,
}

export interface FrontendErrorProps {
    name: string,
    msg: string,
}

export interface NotOKResponseProps {
    msg: string,
}

export interface ErrorHandlerContextType {
    responseError: (err: ResponseErrorProps) => void,
    frontendError: (err: FrontendErrorProps) => void,
    responseErrorFromResponseAndData: (response: Response, data: NotOKResponseProps) => void,
    handleErrors: (err: unknown) => void,
}

class AsyncLoadError extends Error {
    status: number
    statusText: string
    constructor(msg: string, status: number, statusText: string,) {
        super(msg);
        this.name = "AsyncLoadError";
        this.status = status;
        this.statusText = statusText;
    }
  }

export const throwOrReturnFromResponse = (response: Response) => (
    response.json().then(data => {
        if (response.ok)
            return data
        else 
            throw new AsyncLoadError(data.msg, response.status, response.statusText);
    })
)

export const ErrorHandlerContext = createContext<ErrorHandlerContextType>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
    enum Variant {
        timeout, response, frontend
    }

    const [opened, { open, close }] = useDisclosure(false);
    const [variant, setVariant] = useToggle([Variant.response, Variant.timeout, Variant.frontend]);
    const [error, setErr] = useState('');

    const responseError = (props: ResponseErrorProps) => {
        const { status, name, msg } = props;
        setErr(`${status} ${name}: ${msg}`);
        setVariant(Variant.response);
        open();
    };

    const frontendError = (props: FrontendErrorProps) => {
        const { name, msg } = props;
        setErr(`${name}: ${msg}`);
        setVariant(Variant.frontend);
        open();
    };

    const responseErrorFromResponseAndData = (response: Response, data: NotOKResponseProps) =>
        responseError({
            status: response.status,
            name: response.statusText,
            msg: (data as NotOKResponseProps).msg
        });

    const serverTimeout = () => {
        setVariant(Variant.timeout);
        open();
    };

    const handleErrors = (err: unknown) => {
        if (isRouteErrorResponse(err) || err instanceof AsyncLoadError) {
            responseError({
                status: err.status,
                name: err.statusText,
                msg: (err instanceof AsyncLoadError) ? err.message : err.data,
            })
        } else if (err instanceof DOMException && err.message.includes("aborted"))
            serverTimeout();
        else if (err instanceof SyntaxError) {
            frontendError({
                name: "JSONParseError", msg: err.message
            })
        } else if (err instanceof Error) {
            frontendError({
                name: err.name,
                msg: err.message
            })
        } else {
            frontendError({
                name: "Oh My God",
                msg: "this really shouldn't happen"
            })
        }
    }

    const value = {
        responseError,
        responseErrorFromResponseAndData,
        handleErrors,
        frontendError
    };

    return (
        <ErrorHandlerContext.Provider value={value}>
            {children}
            <Modal
                opened={opened}
                onClose={close}
                withCloseButton={false}
                centered
                padding={0}
            >
                <ServerSideErrorAlert open={variant === Variant.response} msg={error} />
                <TimeoutAlert open={variant === Variant.timeout} />
                <FrontendErrorAlert open={variant === Variant.frontend} msg={error} />
            </Modal>
        </ErrorHandlerContext.Provider>
    );
}