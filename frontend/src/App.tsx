import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { RouterProvider } from "react-router-dom";
import { queryClient } from './hooks/api/defaults';
import { FinnanceRouter } from './routes/Router';
import { useCustomTheme } from './theme';

function App() {
    const preferredColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    useEffect(() => {
        setColorScheme(preferredColorScheme);
    }, [preferredColorScheme]);

    const theme = useCustomTheme();

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={{ ...theme, colorScheme }} withGlobalStyles withNormalizeCSS>
                <Notifications />
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={FinnanceRouter} />
                </QueryClientProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}

export default App;
