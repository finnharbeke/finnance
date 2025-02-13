import { Anchor, Button, Card, CardProps, Flex, FocusTrap, Group, GroupProps, PasswordInput, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQueryClient } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { TbChevronDown } from "react-icons/tb";
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { handleAxiosError } from "../../query";
import FinnanceLogo from "../FinnanceLogo";
import { useLogin, usernameExists } from "./api";

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
        <Group justify="flex-end" {...others}>
            <Button
                type="submit" radius="lg"
                loading={loading}
            >Next</Button>
        </Group>
    );
}

export function FormTop({ children }: { children: ReactNode }) {
    return <Group justify='center' mt='xl' style={{ height: 25 }}>
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

    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [continued, setContinued] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const login = useLogin();

    const handleUsername = (values: UsernameInputType) => {
        setLoading(true);
        usernameExists(values.username).then(({ data }) => {
            setLoading(false);
            if (data.exists) {
                setContinued(true);
                setUsername(values.username);
            } else {
                unForm.setFieldError('username', "username doesn't exist")
            }
        }).catch(handleAxiosError);
    }

    const reset = () => {
        pwForm.setFieldValue('password', '');
        setContinued(false);
        setUsername('');
    }

    const handlePassword = (values: PasswordInputType) => {
        setLoading(true);
        login.mutate({ ...values, username }, {
            onSuccess: ({ data }) => {
                if (!data.auth)
                    pwForm.setFieldError('password', "wrong password")
                else {
                    queryClient.invalidateQueries();
                    navigate(location.state?.from?.pathname || '/')
                }
            },
            onSettled: () => setLoading(false)
        })
    }

    return <Card
        className={classes.LoginCard}
        withBorder
        shadow='sm'
        {...others}
    >
        <Flex justify="center" align="center" direction="column">
            <FinnanceLogo size={40} />
            <Title order={1} fw={250}>{continued ? 'welcome' : 'sign in'}</Title>
        </Flex>
        <form onSubmit={unForm.onSubmit(handleUsername)}
            className={continued ? classes.hidden : undefined}>
            <FormTop>to continue</FormTop>
            <FocusTrap active={!continued}>
                <TextInput label="username" radius="lg" variant="filled"
                    {...unForm.getInputProps('username')} />
            </FocusTrap>
            <NextButton loading={loading} my='sm' />
            <Text fz='sm' align='center'>
                no account?
                <Anchor component={Link} ml='xs' to='/register'>
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
                <PasswordInput label="enter your password" radius="lg"
                    variant="filled" {...pwForm.getInputProps('password')} />
            </FocusTrap>
            <NextButton loading={login.isLoading} mt='sm' />
        </form>
    </Card>
}