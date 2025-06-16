import { Button, Card, Flex, FocusTrap, PasswordInput, TextInput, Title, useMatches, Text, Anchor } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FinnanceLogo from "../FinnanceLogo";
import { LoginFormProps } from "./LoginForm";
import { emailExists, useRegister, usernameExists } from "./api";
import { handleAxiosError } from "../../query";

interface SignUpInputType {
    username: string
    email: string
    password: string
    passwordCheck: string
}

export function SignUpForm({ ...others }: LoginFormProps) {

    const form = useForm<SignUpInputType>({
        initialValues: {
            username: '',
            email: '',
            password: '',
            passwordCheck: '',
        },
        validate: {
            username: (value) => value.length < 3 ? "username must be at least 3 characters long" :
                /^[_\da-zA-Z]{3,}$/.test(value) ? null : "username must only contain letters, underscores and digits",
            email: (value) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/.test(value) ? null : "invalid e-mail",
            password: (value) => value.length < 6 ? "password must be at least 6 characters long" : null,
            passwordCheck: (value, values) => values.password !== value ? "passwords don't match" : null,
        }
    })

    const [loading, setLoading] = useState(false);

    const register = useRegister();
    const navigate = useNavigate();

    function handleSubmit(values: SignUpInputType) {
        setLoading(true);
        usernameExists(values.username).then(({ data: un }) => {
            if (un.exists)
                form.setFieldError('username', 'username already in use');
            emailExists(values.email).then(({ data: em }) => {
                if (em.exists)
                    form.setFieldError('email', 'email already in use');
                if (un.exists || em.exists)
                    return
                register.mutate({
                    username: form.values.username,
                    email: form.values.email,
                    password: form.values.password,
                }, {
                    onSuccess: () => navigate('/login'),
                    onSettled: () => setLoading(false)
                })
            }).catch(handleAxiosError)
        }).catch(handleAxiosError).finally(() => setLoading(false))
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
            <Title order={1} fw={250}>sign up</Title>
        </Flex>
        <FocusTrap>
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput label="username" radius="lg" variant="filled" {...form.getInputProps('username')} />
            <TextInput label="e-mail" radius="lg" variant="filled" {...form.getInputProps('email')} />
            <PasswordInput label="password" radius="lg" variant="filled" {...form.getInputProps('password')} />
            <PasswordInput label="repeat password" radius="lg" variant="filled" {...form.getInputProps('passwordCheck')} />
            <Button
                type="submit" radius="lg" my='sm'
                fullWidth
                loading={loading}
                >sign up</Button>
            
        </form>
        </FocusTrap>
        <Text fz='sm' align='center'>
            you already have an account?
            <Anchor component={Link} ml='xs' to='/login'>
                log in
            </Anchor>
        </Text>
    </Card>
}