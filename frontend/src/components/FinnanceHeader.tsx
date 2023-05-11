import { ActionIcon, Burger, Container, createStyles, Grid, Group, Header, Paper, Transition, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavLink } from 'react-router-dom';
import { useAuth } from './auth/api';
import FinnanceLogo from './FinnanceLogo';
import { LightDarkToggle } from './LightDarkToggle';
import Placeholder from './Placeholder';
import { spotlight } from '@mantine/spotlight';
import { AiOutlineThunderbolt } from 'react-icons/ai';

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
    const theme = useMantineTheme();
    const [opened, { toggle, close }] = useDisclosure(false);
    const { classes, cx } = useStyles();
    const query = useAuth();

    if (!query.isSuccess)
        return <Placeholder height={50} queries={[query]}/>

    const auth = query.data.auth;

    const links = [
        { link: "", label: "home" },
        { link: "accounts", label: "accounts" },
        { link: "categories", label: "categories" },
        { link: "analysis", label: "graphs" },
        { link: "logout", label: "logout" }
    ]

    const items = links.map((link) => {
        return <NavLink
            key={link.label}
            to={link.link}
            className={(state: { isActive: boolean; }) => cx(classes.link, { [classes.linkActive]: state.isActive })}
            onClick={close}
        >
            {link.label}
        </NavLink>
    });

    return (
        <Header height={HEADER_HEIGHT} className={classes.root}>
            <Container>
                <Grid justify='space-between' pt='xs'>
                    <Grid.Col span='content'>
                        <Group noWrap={true}>
                            <ActionIcon onClick={() => spotlight.open()}
                                size='lg' variant='light' color={theme.primaryColor}>
                                <AiOutlineThunderbolt size={24} />
                            </ActionIcon>
                            <FinnanceLogo text link size={28} onClick={close}/>
                        </Group>
                    </Grid.Col>
                    {auth &&
                        <Grid.Col span='content'>

                            <Group spacing={5} className={classes.links} position='right'>
                                {items}
                                <LightDarkToggle />
                            </Group>


                            <Group spacing={5} className={classes.burger} position='right'>
                                <Burger opened={opened} onClick={toggle} size="sm" />
                            </Group>

                            <Transition transition="pop-top-right" duration={200} mounted={opened}>
                                {(styles) => (
                                    <Paper className={classes.dropdown} withBorder style={styles}>
                                        {items}
                                        <Group align='center' grow p='xs'>
                                            <LightDarkToggle />
                                        </Group>
                                    </Paper>
                                )}
                            </Transition>
                        </Grid.Col>
                    }
                </Grid>
            </Container>
        </Header>
    );
}