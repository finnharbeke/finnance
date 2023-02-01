import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { NotificationsProvider } from '@mantine/notifications';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { RouterProvider } from "react-router-dom";
import AuthProvider from './contexts/AuthProvider';
import ErrorHandlerProvider from './contexts/ErrorHandlerProvider';
import { FinnanceRouter } from './routes/Router';
import theme from './theme';

const queryClient = new QueryClient()

function App() {
    const preferredColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = useState<ColorScheme>(preferredColorScheme);
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={{ ...theme, colorScheme }} withGlobalStyles withNormalizeCSS>
                <QueryClientProvider client={queryClient}>
                    <NotificationsProvider>
                        <ErrorHandlerProvider>
                            <AuthProvider>
                                <RouterProvider router={FinnanceRouter} />
                            </AuthProvider>
                        </ErrorHandlerProvider>
                    </NotificationsProvider>
                </QueryClientProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}

export default App;
