import { Button, Card, Flex, FocusTrap, Group, PasswordInput, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { createStyles, useMantineTheme } from "@mantine/styles";
import { IconChevronDown } from "@tabler/icons";
import { ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import useErrorHandler from "../hooks/useErrorHandler";
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
    const navigate = useNavigate();
    const { login, exists } = useAuth();
    const location = useLocation();
    const { handleErrors } = useErrorHandler();

    function handleUsername(values: UsernameInputType) {
        setLoading(true);
        exists(values.username).then(data => {
            if (!data.ok)
                return
            if (data?.exists) {
                setUsername(values.username);
                setTitle('welcome');
                setContinued(true);
            } else
                unForm.setFieldError('username', "username doesn't exist")
        }).catch(handleErrors)
            .finally(() => setLoading(false));
    }

    function reset() {
        pwForm.setFieldValue('password', '');
        setTitle('sign in');
        setContinued(false);
    }

    function handlePassword(values: PasswordInputType) {
        setLoading(true);
        login(username, values.password).then(data => {
            if (!data.ok)
                return;
            if (data?.auth)
                navigate(location.state?.from?.pathname || '/');
            else
                pwForm.setFieldError('password', "wrong password");
        }).catch(handleErrors)
            .finally(() => setLoading(false));
    }

    return <Card
        className={classes.LoginCard}
        withBorder
        shadow='sm'
    >
        <Flex justify="center" align="center" direction="column">
            <FinnanceLogo size={40} />
            <Title order={1} fw={250}>{title}</Title>
        </Flex>
        <form onSubmit={unForm.onSubmit(handleUsername)}
            className={continued ? classes.hidden : null}>
            <FormTop>to continue</FormTop>
            <FocusTrap active={!continued}>
                <TextInput label="username" radius="lg" variant="filled" {...unForm.getInputProps('username')} />
            </FocusTrap>
            <NextButton loading={loading} />
        </form>
        <form onSubmit={pwForm.onSubmit(handlePassword)}
            className={continued ? null : classes.hidden}>
            <FormTop>
                <Button onClick={reset}
                    size='xs' variant='light' compact radius="lg"
                    rightIcon={<IconChevronDown size={16} />}
                >{username}</Button>
            </FormTop>
            <FocusTrap active={continued}>
                <PasswordInput label="enter your password" radius="lg" variant="filled" {...pwForm.getInputProps('password')} />
            </FocusTrap>
            <NextButton loading={loading} />
        </form>
    </Card>
}