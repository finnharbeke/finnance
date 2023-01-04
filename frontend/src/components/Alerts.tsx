import { Alert, Code, createStyles } from "@mantine/core";
import { IconAlertCircle, IconZzz } from "@tabler/icons";

interface AlertProps {
    open: boolean,
    msg?: string,
}

const useStyles = createStyles({
    hidden: {
        display: 'none'
    }
})
export function ServerSideErrorAlert({ open, msg }: AlertProps) {
    const { classes } = useStyles();
    return <Alert
        icon={<IconAlertCircle size={16} />}
        title="Oops!" color="red"
        variant="filled"
        className={ open ? null : classes.hidden }
        >
        Something terrible happened!
        <br/>
        The Server didn't handle our request due to
        <br/>
        <Code>{msg}</Code>
        <br/>
        Please contact the developer or try again later!
    </Alert>
}

export function TimeoutAlert({ open }: AlertProps) {
    const { classes } = useStyles();
    return <Alert
        icon={<IconZzz size={16} />}
        title="Server Timeout" color="yellow"
        variant="filled"
        className={ open ? null : classes.hidden }
        >
        The Server isn't responding!
        <br/>
        Please contact the developer or try again later!
    </Alert>

}