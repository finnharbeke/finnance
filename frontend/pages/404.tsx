import { Button, Container, Group, Text, Title, useMantineTheme } from '@mantine/core';
import useIsPhone from '../hooks/useIsPhone';
import Link from 'next/link';

export default function NotFound() {
  const theme = useMantineTheme();
  const isPhone = useIsPhone();
  return (
    <Container>
      <Title size={isPhone ? 160 : 220} fw={900} align='center'
        color={theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}
      >
        404
      </Title>
      <Title order={1} fw={900} align='center' ff={`Greycliff CF, ${theme.fontFamily}`}>
        You have found a secret place.
      </Title>
      <Text color="dimmed" size="lg" align="center" my='sm' mx='auto'>
        Unfortunately, this is only a 404 page. You may have mistyped the address, or the page has
        been moved to another URL.
      </Text>
      <Group position="center">
        <Button component={Link} href={'/'} variant="subtle" size="md">
          Take me back to home page
        </Button>
      </Group>
    </Container>
  );
}
