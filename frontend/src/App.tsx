import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { RouterProvider } from "react-router-dom";
import { queryClient } from './query';
import { FinnanceRouter } from './routes/Router';
import { useCustomTheme } from './theme';
import FinnanceModalProvider from './contexts/ModalProvider';
import { FinnanceSpotlight } from './actions/Spotlight';

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
                    <FinnanceModalProvider>
                        <FinnanceSpotlight>
                            <RouterProvider router={FinnanceRouter} />
                        </FinnanceSpotlight>
                    </FinnanceModalProvider>
                </QueryClientProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}

export default App;
