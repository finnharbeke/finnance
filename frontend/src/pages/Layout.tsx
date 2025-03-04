import { AppShell, Avatar, Burger, Container, Group, Loader, NavLink, NavLinkProps, ScrollArea, Stack, Text, useComputedColorScheme, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { spotlight } from '@mantine/spotlight';
import { useEffect } from 'react';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { TbArrowWaveRightUp, TbChartDonut, TbCoins, TbColorFilter, TbHistory, TbHome, TbList, TbLogout, TbMoneybag, TbReceipt, TbReceiptRefund, TbTemplate } from 'react-icons/tb';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FinnanceSpotlight } from '../actions/Spotlight';
import FinnanceLogo from '../components/FinnanceLogo';
import { MyIcon } from '../components/Icons';
import { LightDarkToggle } from '../components/LightDarkToggle';
import useIsPhone from '../hooks/useIsPhone';
import { useCurrentUser } from '../query';
import { useAccounts } from '../types/Account';

export const PublicLayout = () =>
    <AppShell header={{ height: 60 }} padding='lg'>
        <PublicHeader />
        <AppShell.Main>
            <Container>
                <Outlet />
            </Container>
        </AppShell.Main>
    </AppShell>


export const AuthLayout = () => {
    const location = useLocation();

    const [mobileOpen, { toggle: mobileToggle, close: mobileClose }] = useDisclosure(false);
    const [desktopOpen, { toggle: desktopToggle, close: desktopClose }] = useDisclosure(false);

    useEffect(() => { mobileClose(); desktopClose(); }, [location.pathname, mobileClose, desktopClose]);

    return <AppShell
        header={{height: 60}}
        navbar={{
            breakpoint: 'sm', width: { xs: 300  },
            collapsed: { mobile: !mobileOpen, desktop: !desktopOpen }
        }}
        // padding='lg'
        padding={0}
    >
        <AuthNavbar/>
        <AuthHeader {...{ mobileOpen, mobileToggle, desktopOpen, desktopToggle }} />
        <AppShell.Main>
            <Container mt='md'>
                <Outlet />
            </Container>
        </AppShell.Main>
        <FinnanceSpotlight />
    </AppShell>
}

const PublicHeader = () =>
    <AppShell.Header p='sm'>
        <FinnanceLogo text link size={32} />
    </AppShell.Header>

const AuthHeader = ({ mobileOpen, mobileToggle, desktopOpen, desktopToggle }: {
        mobileOpen: boolean, mobileToggle: () => void, desktopOpen: boolean, desktopToggle: () => void
    }) => {
    const theme = useMantineTheme();
    const isPhone = useIsPhone();
    return <AppShell.Header p='sm'>
        <Group justify='space-between'>
            <Burger opened={mobileOpen} onClick={mobileToggle} hidden={!isPhone} size="sm"/>
            <Burger opened={desktopOpen} onClick={desktopToggle} hidden={isPhone} size="sm"/>
            <FinnanceLogo text link size={32} />
            <MyIcon icon={AiOutlineThunderbolt} color={theme.other.colors.quick}
                onClick={() => spotlight.open()} radius='xl'
                variant='light' />
        </Group>
    </AppShell.Header>
}

interface MyNavLinkProps extends NavLinkProps {
    to?: string
    links?: Omit<MyNavLinkProps, 'close'>[]
}

const NavbarLink = ({ to, links, ...others }: MyNavLinkProps) => {
    const navigate = useNavigate();
    const { pathname: location } = useLocation();

    return <NavLink
        onClick={() => {
            if (!to)
                return
            navigate(to)
        }}
        active={
            location === to
            // (to !== undefined && location.startsWith(to) && location.charAt(to.length) === "/")
        }
        {...others}
    >
        {
            links?.map((data, i) => <NavbarLink {...data} key={i} />)
        }
    </NavLink>
}

const AuthNavbar = () => {
    const query = useCurrentUser();
    const accsQuery = useAccounts();
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme();

    const FinnanceLinks: Omit<MyNavLinkProps, 'close'>[] = [
        { to: "/", label: "home", leftSection: <TbHome size='1.5rem' /> },
        {
            label: "accounts", leftSection: <TbMoneybag size='1.5rem' />,
            links: [
                { to: "/accounts", label: "all accounts", leftSection: <TbList size='1.5rem' /> }
                , ...(
                    accsQuery.isSuccess ?
                        accsQuery.data?.map(acc => ({
                            to: `/accounts/${acc.id}`, label: acc.desc,
                            leftSection: <TbCoins size='1.5rem'/>
                        }))
                        : []
                )
            ]
        },
        { to: "/categories", label: "categories", leftSection: <TbColorFilter size='1.5rem' /> },
        { to: "/analytics", label: "analytics", leftSection: <TbChartDonut size='1.5rem' /> },
        {
            label: "archive", leftSection: <TbHistory size='1.5rem' />,
            links: [
                { to: "/transactions", label: "transactions", leftSection: <TbReceipt size='1.5rem' /> },
                {
                    to: "/flows", label: "flows",
                    leftSection: <TbArrowWaveRightUp size='1.5rem' />, color: theme.other.colors.flow
                },
                {
                    to: "/records", label: "records",
                    leftSection: <TbColorFilter size='1.5rem' />
                },
                {
                    to: "/remotes", label: "remote transactions",
                    leftSection: <TbReceiptRefund size='1.5rem' />, color: theme.other.colors.flow
                },
            ]
        },
        {
            to: "/templates", label: "templates",
            leftSection: <TbTemplate size='1.5rem' />, color: theme.other.colors.quick
        },
        { to: "/logout", label: "logout", leftSection: <TbLogout size='1.5rem' /> }
    ]

    return <AppShell.Navbar>
        <AppShell.Section grow component={ScrollArea}>
            {FinnanceLinks.map((data, i) => <NavbarLink key={i} {...data} />)}
        </AppShell.Section>
        <AppShell.Section style={{
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3],
        }} pt='sm' mx='md' mt='sm'>
            <Group grow>
                <LightDarkToggle />
            </Group>
        </AppShell.Section>
        <AppShell.Section pt='sm' mx='md' mb='xl'>
            <Group wrap="nowrap">
                {query.isSuccess &&
                    <Avatar color={theme.primaryColor} radius='xl'>{query.data.username.at(0)}</Avatar>
                }
                {query.isSuccess &&
                    <Stack gap={0}>
                        <Text lineClamp={1}>{query.data.username}</Text>
                        <Text fz='xs' c='dimmed' lineClamp={1}>{query.data.email}</Text>
                    </Stack>
                }
                {!query.isSuccess &&
                    <Loader />
                }
            </Group>
        </AppShell.Section>
    </AppShell.Navbar>
}