import { AppShell, Avatar, Burger, Container, Flex, Grid, Group, Header, Loader, NavLink, NavLinkProps, Navbar, ScrollArea, Stack, Text, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { spotlight } from '@mantine/spotlight';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { TbArrowWaveRightUp, TbColorFilter, TbEdit, TbGraph, TbHistory, TbHome, TbLogout, TbMoneybag, TbTemplate } from 'react-icons/tb';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthSpotlight } from '../actions/Spotlight';
import FinnanceLogo from '../components/FinnanceLogo';
import { MyIcon } from '../components/Icons';
import useIsPhone from '../hooks/useIsPhone';
import { useCurrentUser } from '../query';
import { useAccounts } from '../types/Account';

export const PublicLayout = () =>
    <AppShell header={<PublicHeader />} padding='lg'>
        <Container>
            <Outlet />
        </Container>
    </AppShell>


export const AuthLayout = () => {
    useAuthSpotlight();

    const [open, { toggle, close }] = useDisclosure(false);

    return <AppShell
        header={<AuthHeader {...{ open, toggle }} />}
        // padding='lg'
        navbar={<AuthNavbar open={open} close={close} />}
        navbarOffsetBreakpoint={30000}
        padding={0}
    >
        <Container mt='md'>
            <Outlet />
        </Container>
    </AppShell>
}

const PublicHeader = () =>
    <Header height={60} p='sm'>
        <Group grow>
            <FinnanceLogo text size={32} />
        </Group>
    </Header>

const AuthHeader = ({ open, toggle }: { open: boolean, toggle: () => void }) => {
    const isPhone = useIsPhone();
    return <Header height={60} p='sm'>
        <Grid>
            <Grid.Col span={2}>
                <Burger
                    opened={open}
                    onClick={toggle}
                    size="sm"
                    />
            </Grid.Col>
            <Grid.Col span={8}>
                <FinnanceLogo text link size={32} />
            </Grid.Col>
            <Grid.Col span={2}>
                {/* align to the right */}
                {
                    isPhone &&
                    <Flex direction='row-reverse'>
                        <MyIcon icon={AiOutlineThunderbolt} color='indigo'
                            onClick={() => spotlight.open()} radius='xl'
                            variant='light' />
                    </Flex>
                }
            </Grid.Col>
        </Grid>
    </Header>
}

interface MyNavLinkProps extends NavLinkProps {
    to?: string
    links?: Omit<MyNavLinkProps, 'close'>[]
    close: () => void
}

const NavbarLink = ({ to, links, close, ...others }: MyNavLinkProps) => {
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const { pathname: location } = useLocation();

    return <NavLink my='xs'
        onClick={() => {
            if (!to)
                return
            close()
            navigate(to)
        }}
        style={{ borderRadius: theme.fn.radius() }}
        active={
            location === to
            // (to !== undefined && location.startsWith(to) && location.charAt(to.length) === "/")
        }
        {...others}
    >
        {
            links?.map((data, i) => <NavbarLink {...data} close={close} key={i} />)
        }
    </NavLink>
}

const AuthNavbar = ({ open, close }: { open: boolean, close: () => void }) => {
    const query = useCurrentUser();
    const accsQuery = useAccounts();
    const theme = useMantineTheme();

    const FinnanceLinks: Omit<MyNavLinkProps, 'close'>[] = [
        { to: "/", label: "home", icon: <TbHome size='1.5rem' /> },
        {
            label: "accounts", icon: <TbMoneybag size='1.5rem' />,
            links: [
                { to: "/accounts", label: "all accounts", icon: <TbEdit size='1.5rem' /> }
                , ...(
                    accsQuery.isSuccess ?
                        accsQuery.data?.map(acc => ({
                            to: `/accounts/${acc.id}`, label: acc.desc
                        }))
                        : []
                )
            ]
        },
        { to: "/categories", label: "categories", icon: <TbColorFilter size='1.5rem' /> },
        { to: "/analytics", label: "analytics", icon: <TbGraph size='1.5rem' /> },
        { to: "/transactions", label: "transactions", icon: <TbHistory size='1.5rem' /> },
        { to: "/remotes", label: "remote transactions", icon: <TbArrowWaveRightUp size='1.5rem' /> },
        { to: "/templates", label: "templates", icon: <TbTemplate size='1.5rem' /> },
        { to: "/logout", label: "logout", icon: <TbLogout size='1.5rem' /> }
    ]

    return <Navbar width={{ xs: 300 }} p='xs' hidden={!open} hiddenBreakpoint={30000}>
        <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
            {FinnanceLinks.map((data, i) => <NavbarLink key={i} {...data} close={close} />)}
        </Navbar.Section>
        <Navbar.Section style={{
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3],
        }} pt='sm' mx='md' mb='xl' mt='sm'>
            <Group noWrap>
                {query.isSuccess &&
                    <Avatar color={theme.fn.primaryColor()} radius='xl'>{query.data.username.at(0)}</Avatar>
                }
                {query.isSuccess &&
                    <Stack spacing={0}>
                        <Text lineClamp={1}>{query.data.username}</Text>
                        <Text fz='xs' c='dimmed' lineClamp={1}>{query.data.email}</Text>
                    </Stack>
                }
                {!query.isSuccess &&
                    <Loader />
                }
            </Group>
        </Navbar.Section>
    </Navbar>
}