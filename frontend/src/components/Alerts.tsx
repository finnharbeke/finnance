import { Alert, Code, createStyles } from "@mantine/core";
import { TbAlertCircle } from "react-icons/tb";
import { RiZzzFill } from "react-icons/ri";

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
        icon={<TbAlertCircle />}
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

export function FrontendErrorAlert({ open, msg }: AlertProps) {
    const { classes } = useStyles();
    return <Alert
        icon={<TbAlertCircle />}
        title="Oops!" color="red"
        variant="filled"
        className={ open ? null : classes.hidden }
        >
        Something terrible happened!
        <br/>
        The Frontend didn't render due to
        <br/>
        <Code>{msg}</Code>
        <br/>
        Please contact the developer or try again later!
    </Alert>
}

export function TimeoutAlert({ open }: AlertProps) {
    const { classes } = useStyles();
    return <Alert
        icon={<RiZzzFill size={16} />}
        title="Server Timeout" color="yellow"
        variant="filled"
        className={ open ? null : classes.hidden }
        >
        The Server isn't responding!
        <br/>
        Please contact the developer or try again later!
    </Alert>

}