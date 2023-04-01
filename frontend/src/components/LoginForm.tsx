import { Button, Card, CardProps, Flex, FocusTrap, Group, GroupProps, PasswordInput, TextInput, Text, Title, Anchor } from "@mantine/core";
import { useForm } from "@mantine/form";
import { createStyles } from "@mantine/styles";
import { ReactNode, useState } from "react";
import { TbChevronDown } from "react-icons/tb";
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

interface NextButtonProps extends GroupProps {
    loading: boolean
}

export function NextButton({ loading, ...others }: NextButtonProps) {
    return (
        <Group position="right" {...others}>
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

export interface LoginFormProps extends Omit<CardProps, 'children'> {
    
}

export const useLoginFormStyles = createStyles(theme => ({
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
}))

export function LoginForm({ ...others }: LoginFormProps) {
    const { classes } = useLoginFormStyles();

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
        {...others}
    >
        <Flex justify="center" align="center" direction="column">
            <FinnanceLogo size={40} />
            <Title order={1} fw={250}>{title}</Title>
        </Flex>
        <form onSubmit={unForm.onSubmit(handleUsername)}
            className={continued ? classes.hidden : undefined}>
            <FormTop>to continue</FormTop>
            <FocusTrap active={!continued}>
                <TextInput label="username" radius="lg" variant="filled" {...unForm.getInputProps('username')} />
            </FocusTrap>
            <NextButton loading={loading} my='sm'/>
            <Text fz='sm' align='center'>
                no account?
                <Anchor ml='xs' href='/register'>
                    sign up
                </Anchor>
            </Text>
        </form>
        <form onSubmit={pwForm.onSubmit(handlePassword)}
            className={continued ? undefined : classes.hidden}>
            <FormTop>
                <Button onClick={reset}
                    size='xs' variant='light' compact radius="lg"
                    rightIcon={<TbChevronDown size={16} />}
                >{username}</Button>
            </FormTop>
            <FocusTrap active={continued}>
                <PasswordInput label="enter your password" radius="lg" variant="filled" {...pwForm.getInputProps('password')} />
            </FocusTrap>
            <NextButton loading={loading} mt='sm'/>
        </form>
    </Card>
}