import { Button, Card, Flex, FocusTrap, Group, PasswordInput, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { createStyles, useMantineTheme } from "@mantine/styles";
import { IconChevronDown } from "@tabler/icons";
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import { ServerSideErrorAlert, TimeoutAlert } from "./Alerts";
import FinnanceLogo from "./FinnanceLogo";

interface UsernameInputType {
    username: string
}

interface PasswordInputType {
    password: string
}

export function NextButton({ loading }: { loading: boolean }) {
    return (
    <Group position="right" mt="md">
        <Button
            type="submit" radius="lg"
            loading={loading}
        >Next</Button>
    </Group>
    );
}

export function FormTop({ children }: { children: ReactNode }) {
    return <Group position='center' mt='xl' sx={{ height: 25 }}>
        {children}
    </Group>
}

export function LoginForm({ url }: { url?: string }) {
    url = url === undefined ? 'dashboard' : url;
    const theme = useMantineTheme();
    const useStyles = createStyles({
        LoginCard: {
            maxWidth: '50%',
            margin: 'auto',
            [theme.fn.smallerThan('md')]: {
                maxWidth: '60%'
            },
            [theme.fn.smallerThan('sm')]: {
                maxWidth: '70%'
            },
            [theme.fn.smallerThan('xs')]: {
                maxWidth: '90%'
            },
        },
        hidden: {
            display: 'none'
        }
    });
    const { classes } = useStyles();
    
    const unForm = useForm<UsernameInputType>({
        initialValues: {
            username: ''
        },
        validate: {
            username: (value) => value.length < 3 ? "username must be at least 3 characters long" : null
        }
    })
    const pwForm = useForm<PasswordInputType>({
        initialValues: {
            password: ''
        },
        validate: {
            password: (value) => value.length < 6 ? "password must be at least 6 characters long" : null
        }
    })

    const [loading, setLoading] = useState(false);
    const [continued, setContinued] = useState(false);
    const [username, setUsername] = useState('');
    const [title, setTitle] = useState('sign in');
    const [alertOpen, alert] = useDisclosure(false);
    const [msg, setMsg] = useState('');
    const [timeoutOpen, timeout] = useDisclosure(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    function handleUsername(values: UsernameInputType) {
        setLoading(true);
        fetch("api/exists",
            {
                method:'post',
                body: JSON.stringify({
                    username: values.username
                }),
                signal: AbortSignal.timeout(3000)
            }
        ).then(r =>  {
            return (r.status === 200 ?
            r.json().then(data => {
                if (data.exists) {
                    setUsername(values.username);
                    setTitle('welcome');
                    alert.close();
                    timeout.close();
                    setContinued(true);
                } else {
                    unForm.setFieldError('username', "username doesn't exist")
                }
            })
            :
            r.text().then(data => {
                // some serverside error
                setMsg(`${r.status}: ${data}`);
                alert.open();
            }))
        }).catch(e => {
            timeout.open();
        }).then(() => setLoading(false));
    }
    
    function reset() {
        alert.close();
        timeout.close();
        pwForm.setFieldValue('password', '');
        setContinued(false);
    }

    function handlePassword(values: PasswordInputType) {
        let redirected = false;
        setLoading(true);
        login(username, values.password).then(data => {
            if (data.status === 200) {
                if (data.success) {
                    navigate("/");
                    redirected = true;
                } else {
                    pwForm.setFieldError('password', "wrong password")
                }
            } else {
                setMsg(`${data.status}: ${data.error}`);
                alert.open();
            }
        }).catch(e => {
            console.log(e);
            timeout.open();
        }).then(() => {
            if (!redirected)
                setLoading(false);
        });
    }

    return <Card 
        className={ classes.LoginCard }
        withBorder
        shadow='sm'
        >   
            <Flex justify="center" align="center" direction="column">
                <FinnanceLogo size={40}/>
                <Title order={1} fw={250}>{title}</Title>
            </Flex>
            <form onSubmit={unForm.onSubmit(handleUsername)}
                className={continued ? classes.hidden : null}>
                <FormTop>to continue</FormTop>
                <FocusTrap active={!continued}>
                <TextInput label="username" radius="lg" variant="filled" {...unForm.getInputProps('username')} />
                </FocusTrap>
                <NextButton loading={loading}/>
            </form>
            <form onSubmit={pwForm.onSubmit(handlePassword)}
                className={continued ? null : classes.hidden}>
                <FormTop>
                    <Button onClick={reset}
                        size='xs' variant='light' compact radius="lg"
                        rightIcon={<IconChevronDown size={16}/>}
                    >{username}</Button>
                </FormTop>
                <FocusTrap active={continued}>
                <PasswordInput label="enter your password" radius="lg" variant="filled" {...pwForm.getInputProps('password')} />
                </FocusTrap>
                <NextButton loading={loading}/>
            </form>
            <ServerSideErrorAlert open={alertOpen} handlers={alert} msg={msg}/>
            <TimeoutAlert open={timeoutOpen} handlers={timeout}/>
    </Card>
}