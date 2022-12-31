import { Burger, Container, createStyles, Group, Header, Paper, Transition } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavLink } from 'react-router-dom';
import { LightDarkToggle } from '../components/LightDarkToggle';
import useAuth from '../hooks/useAuth';
import FinnanceLogo from './FinnanceLogo';

const HEADER_HEIGHT = 60;

const useStyles = createStyles((theme) => ({
    root: {
        position: 'relative',
        zIndex: 1,
    },

    dropdown: {
        position: 'absolute',
        top: HEADER_HEIGHT,
        left: 0,
        right: 0,
        zIndex: 0,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        borderTopWidth: 0,
        overflow: 'hidden',

        [theme.fn.largerThan('sm')]: {
            display: 'none',
        },
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
    },

    links: {
        [theme.fn.smallerThan('sm')]: {
            display: 'none',
        },
    },

    burger: {
        [theme.fn.largerThan('sm')]: {
            display: 'none',
        },
    },

    link: {
        display: 'block',
        lineHeight: 1,
        padding: '8px 12px',
        borderRadius: theme.radius.sm,
        textDecoration: 'none',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
        fontSize: theme.fontSizes.sm,
        fontWeight: 500,

        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        },

        [theme.fn.smallerThan('sm')]: {
            borderRadius: 0,
            padding: theme.spacing.md,
        },
    },

    linkActive: {
        '&, &:hover': {
            backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
            color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
        },
    },
}));

export default function FinnanceHeader() {
    const [opened, { toggle }] = useDisclosure(false);
    const { classes, cx } = useStyles();
    const { token } = useAuth();

    const links = [
        { link: "/", label: "home" },
        { link: "/admin", label: "admin" },
        { link: "/logout", label: "logout" }
    ]

    const items = links.map((link) => {
        return <NavLink
            key={link.label}
            to={link.link}
            className={(state) => cx(classes.link, { [classes.linkActive]: state.isActive })}
        >
            {link.label}
        </NavLink>
    });

    return (
        <Header height={HEADER_HEIGHT} mb='xl' className={classes.root}>
            <Container className={classes.header}>
                <Group spacinng={5}>
                    <LightDarkToggle />
                    <FinnanceLogo text size={28} />
                </Group>
                {token &&
                    <>
                        <Group spacing={5} className={classes.links}>
                            {items}
                        </Group>


                        <Group spacing={5} className={classes.burger}>
                            <Burger opened={opened} onClick={toggle} size="sm" />
                        </Group>

                        <Transition transition="pop-top-right" duration={200} mounted={opened}>
                            {(styles) => (
                                <Paper className={classes.dropdown} withBorder style={styles}>
                                    {items}
                                </Paper>
                            )}
                        </Transition>
                    </>
                }
            </Container>
        </Header>
    );
}