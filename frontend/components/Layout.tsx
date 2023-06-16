import { AppShell, Avatar, Burger, Container, Flex, Grid, Group, Header, Loader, NavLink, NavLinkProps, Navbar, ScrollArea, Stack, Text, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { spotlight } from '@mantine/spotlight';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { TbArrowWaveRightUp, TbChartDonut, TbCoins, TbColorFilter, TbHistory, TbHome, TbList, TbLogout, TbMoneybag, TbReceipt, TbReceiptRefund, TbTemplate } from 'react-icons/tb';
import { useAuthSpotlight } from '../actions/Spotlight';
import FinnanceLogo from './FinnanceLogo';
import { MyIcon } from './Icons';
import { LightDarkToggle } from './LightDarkToggle';
import useIsPhone from '../hooks/useIsPhone';
import { useCurrentUser } from '../actions/query';
import { useAccounts } from '../types/Account';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';

export const PublicLayout = ({ children }: { children: ReactNode }) =>
    <AppShell header={<PublicHeader />} padding='lg'>
        <Container>
            {children}
        </Container>
    </AppShell>


export const AuthLayout = ({ children }: { children: ReactNode }) => {
    useAuthSpotlight();

    const router = useRouter();
    const [open, { toggle, close }] = useDisclosure(false);

    useEffect(() => close(), [router.pathname, close]);

    return <AppShell
        header={<AuthHeader {...{ open, toggle }} />}
        // padding='lg'
        navbar={<AuthNavbar open={open} />}
        navbarOffsetBreakpoint={30000}
        padding={0}
    >
        <Container mt='md'>
            {children}
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
    const theme = useMantineTheme();
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
                        <MyIcon icon={AiOutlineThunderbolt} color={theme.other.colors.quick}
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
}

const NavbarLink = ({ to, links, ...others }: MyNavLinkProps) => {
    const theme = useMantineTheme();
    const router = useRouter();

    return <NavLink my='xs'
        onClick={() => {
            if (!to)
                return
            router.push(to)
        }}
        style={{ borderRadius: theme.fn.radius() }}
        active={
            router.pathname === to
            // (to !== undefined && location.startsWith(to) && location.charAt(to.length) === "/")
        }
        {...others}
    >
        {
            links?.map((data, i) => <NavbarLink {...data} key={i} />)
        }
    </NavLink>
}

const AuthNavbar = ({ open }: { open: boolean }) => {
    const query = useCurrentUser();
    const accsQuery = useAccounts();
    const theme = useMantineTheme();

    const FinnanceLinks: Omit<MyNavLinkProps, 'close'>[] = [
        { to: "/", label: "home", icon: <TbHome size='1.5rem' /> },
        {
            label: "accounts", icon: <TbMoneybag size='1.5rem' />,
            links: [
                { to: "/accounts", label: "all accounts", icon: <TbList size='1.5rem' /> }
                , ...(
                    accsQuery.isSuccess ?
                        accsQuery.data?.map(acc => ({
                            to: `/accounts/${acc.id}`, label: acc.desc,
                            icon: <TbCoins size='1.5rem'/>
                        }))
                        : []
                )
            ]
        },
        { to: "/categories", label: "categories", icon: <TbColorFilter size='1.5rem' /> },
        { to: "/analytics", label: "analytics", icon: <TbChartDonut size='1.5rem' /> },
        {
            label: "archive", icon: <TbHistory size='1.5rem' />,
            links: [
                { to: "/transactions", label: "transactions", icon: <TbReceipt size='1.5rem' /> },
                {
                    to: "/flows", label: "flows",
                    icon: <TbArrowWaveRightUp size='1.5rem' />, color: theme.other.colors.flow
                },
                {
                    to: "/records", label: "records",
                    icon: <TbColorFilter size='1.5rem' />
                },
                {
                    to: "/remotes", label: "remote transactions",
                    icon: <TbReceiptRefund size='1.5rem' />, color: theme.other.colors.flow
                },
            ]
        },
        {
            to: "/templates", label: "templates",
            icon: <TbTemplate size='1.5rem' />, color: theme.other.colors.quick
        },
        { to: "/logout", label: "logout", icon: <TbLogout size='1.5rem' /> }
    ]

    return <Navbar width={{ xs: 300 }} p='xs' hidden={!open} hiddenBreakpoint={30000}>
        <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
            {FinnanceLinks.map((data, i) => <NavbarLink key={i} {...data} />)}
        </Navbar.Section>
        <Navbar.Section style={{
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3],
        }} pt='sm' mx='md' mt='sm'>
            <Group grow>
                <LightDarkToggle />
            </Group>
        </Navbar.Section>
        <Navbar.Section pt='sm' mx='md' mb='xl'>
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
