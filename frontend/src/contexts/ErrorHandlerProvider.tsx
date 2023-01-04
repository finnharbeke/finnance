import { Modal } from "@mantine/core";
import { useDisclosure, useToggle } from "@mantine/hooks";
import { createContext, ReactNode, useState } from "react";
import { ServerSideErrorAlert, TimeoutAlert } from "../components/Alerts";

export interface ResponseErrorProps {
    status: number,
    name: string,
    msg: string,
}

export interface NotOKResponseProps {
    msg: string,
}

export interface ErrorHandlerContextType {
    responseError: (err: ResponseErrorProps) => void,
    responseErrorFromResponseAndData: (response: Response, data: NotOKResponseProps) => void,
    handleFetchErrors: (err: Error) => void,
}

export const throwOrReturnFromResponse = (response: Response) => (
    response.json().then(data => {
        if (response.ok)
            return data
        else 
            throw new Response(data.msg, { status: response.status, statusText: response.statusText })
    })
)

export const ErrorHandlerContext = createContext<ErrorHandlerContextType>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
    enum Variant {
        timeout, response
    }

    const [opened, { open, close }] = useDisclosure(false);
    const [variant, setVariant] = useToggle([Variant.response, Variant.timeout]);
    const [error, setErr] = useState('');

    const responseError = (props: ResponseErrorProps) => {
        const { status, name, msg } = props;
        setErr(`${status} ${name}: ${msg}`);
        setVariant(Variant.response);
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

    const handleFetchErrors = (err: Error) => {
        if (err instanceof DOMException && err.message.includes("aborted"))
            serverTimeout();
        else if (err instanceof SyntaxError) {
            responseError({
                status: 0, name: "idk", msg: err.message
            })
            console.log({ ...err, hi: "hi"})
        }
        else
            console.log({ ...err })
    }

    const value = {
        responseError,
        responseErrorFromResponseAndData,
        handleFetchErrors,
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
            </Modal>
        </ErrorHandlerContext.Provider>
    );
}