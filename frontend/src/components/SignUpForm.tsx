import { Button, Card, Flex, FocusTrap, PasswordInput, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useErrorHandler from "../hooks/useErrorHandler";
import FinnanceLogo from "./FinnanceLogo";
import { LoginFormProps, useLoginFormStyles } from "./LoginForm";

interface SignUpInputType {
    username: string
    email: string
    password: string
    passwordCheck: string
}

export function SignUpForm({ ...others }: LoginFormProps) {
    const { classes } = useLoginFormStyles();

    const suForm = useForm<SignUpInputType>({
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
    const { handleErrors } = useErrorHandler();
    const { register, exists, existsMail } = useAuth();
    const navigate = useNavigate();

    function handleSubmit(values: SignUpInputType) {
        setLoading(true);
        exists(values.username).then(data => {
            if (!data.ok)
                return
            if (data?.exists) {
                suForm.setFieldError('username', "username already taken")
                return
            }
            return existsMail(values.email).then(data => {
                if (!data.ok)
                    return
                if (data?.exists) {
                    suForm.setFieldError('email', "e-mail already taken")
                    return
                }
                register(
                    values.username, values.email, values.password
                ).then(data => {
                    if (!data.ok)
                        return
                    if (!data?.success) {
                        suForm.setFieldError('username', "signup failed!")
                        return
                    }
                    navigate('/login');
                })
            })            
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
            <Title order={1} fw={250}>sign up</Title>
        </Flex>
        <form onSubmit={suForm.onSubmit(handleSubmit)}>
            {/* <FormTop>to continue</FormTop> */}
            <FocusTrap>
                <TextInput label="username" radius="lg" variant="filled" {...suForm.getInputProps('username')} />
            </FocusTrap>
            <TextInput label="e-mail" radius="lg" variant="filled" {...suForm.getInputProps('email')} />
            <PasswordInput label="password" radius="lg" variant="filled" {...suForm.getInputProps('password')} />
            <PasswordInput label="repeat password" radius="lg" variant="filled" {...suForm.getInputProps('passwordCheck')} />
            {/* <NextButton loading={loading} my='sm'/> */}
            <Button
                type="submit" radius="lg" mt='sm'
                fullWidth
                loading={loading}
            >sign up</Button>
        </form>
    </Card>
}