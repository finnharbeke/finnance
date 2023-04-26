import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ReactNode, createContext, useState } from "react";
import { FrontendErrorAlert } from "../components/Alerts";

export interface FrontendErrorProps {
    name: string,
    msg: string,
}
export interface ErrorHandlerContextType {
    frontendError: (err: FrontendErrorProps) => void,
    handleErrors: (err: unknown) => void,
}

export const ErrorHandlerContext = createContext<ErrorHandlerContextType>({
    frontendError: () => {},
    handleErrors: () => {}
});

export default function ErrorHandlerProvider({ children }: { children: ReactNode }) {

    const [opened, { open, close }] = useDisclosure(false);
    const [error, setErr] = useState('');

    const frontendError = (props: FrontendErrorProps) => {
        const { name, msg } = props;
        setErr(`${name}: ${msg}`);
        open();
    };

    const handleErrors = (err: unknown) => {
        if (err instanceof Error) {
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
                <FrontendErrorAlert msg={error} />
            </Modal>
        </ErrorHandlerContext.Provider>
    );
}