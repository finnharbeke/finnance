import { Button, Container, Group, Text, Title, useComputedColorScheme, useMantineTheme } from '@mantine/core';
import { Link } from 'react-router-dom';
import useIsPhone from '../hooks/useIsPhone';

export default function NotFound() {
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme();
  const isPhone = useIsPhone();
  return (
    <Container>
      <Title size={isPhone ? 160 : 220} fw={900} ta='center'
        c={colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}
      >
        404
      </Title>
      <Title order={1} fw={900} ta='center' ff={`Greycliff CF, ${theme.fontFamily}`}>
        You have found a secret place.
      </Title>
      <Text color="dimmed" size="lg" align="center" my='sm' mx='auto'>
        Unfortunately, this is only a 404 page. You may have mistyped the address, or the page has
        been moved to another URL.
      </Text>
      <Group justify='center'>
        <Button component={Link} to={'/'} variant="subtle" size="md">
          Take me back to home page
        </Button>
      </Group>
    </Container>
  );
}