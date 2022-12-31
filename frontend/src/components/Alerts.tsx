import { Alert, Code, createStyles } from "@mantine/core";
import { IconAlertCircle, IconZzz } from "@tabler/icons";

interface AlertProps {
    open: boolean,
    handlers: {
        open: () => void;
        close: () => void;
        toggle: () => void;
    },
    msg?: string,
}

const useStyles = createStyles({
    hidden: {
        display: 'none'
    }
})
export function ServerSideErrorAlert({ open, handlers, msg }: AlertProps) {
    const { classes } = useStyles();
    return <Alert
        icon={<IconAlertCircle size={16} />}
        title="Oops!" color="red" mt='md'
        withCloseButton closeButtonLabel="close alert"
        onClose={() => handlers.close()}
        className={ open ? null : classes.hidden }
        >
        Something terrible happened!
        The Server didn't handle our request due to 
        <Code color="yellow">{msg}</Code>.
        <br/>
        Please contact the developer or try again later!
    </Alert>
}

export function TimeoutAlert({ open, handlers }: AlertProps) {
    const { classes } = useStyles();
    return <Alert
        icon={<IconZzz size={16} />}
        title="Server Timeout" color="yellow" mt='md'
        withCloseButton closeButtonLabel="close alert"
        onClose={() => handlers.close()}
        className={ open ? null : classes.hidden }
        >
        The Server isn't responding!
        <br/>
        Please contact the developer or try again later!
    </Alert>

}