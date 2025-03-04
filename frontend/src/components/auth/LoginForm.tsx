import { Anchor, Button, Card, CardProps, Flex, FocusTrap, Group, GroupProps, PasswordInput, Text, TextInput, Title, useMatches } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQueryClient } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { TbChevronDown } from "react-icons/tb";
import { useNavigate } from "react-router";
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

export function LoginForm({ ...others }: LoginFormProps) {

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
                queryClient.invalidateQueries(["auth"]).then(() => {
                    if (!data.auth)
                        pwForm.setFieldError('password', "wrong password")
                    else {
                        navigate('/')
                    }
                })
            },
            onSettled: () => setLoading(false)
        })
    }

    const maxWidth = useMatches({
        base: '90%',
        xs: '70%',
        sm: '60%',
        md: '50%'
    })

    return <Card
        style={{
            margin: 'auto',
            maxWidth
        }}
        withBorder
        shadow='sm'
        {...others}
    >
        <Flex justify="center" align="center" direction="column">
            <FinnanceLogo size={40} />
            <Title order={1} fw={250}>{continued ? 'welcome' : 'sign in'}</Title>
        </Flex>
        <form onSubmit={unForm.onSubmit(handleUsername)} hidden={continued}>
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
            hidden={!continued}>
            <FormTop>
                <Button onClick={reset}
                    size='compact-xs' variant='light' radius="lg"
                    rightSection={<TbChevronDown size={16} />}
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