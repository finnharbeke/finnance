import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { RouterProvider } from "react-router-dom";
import AuthProvider from './contexts/AuthProvider';
import ErrorModalProvider from './contexts/ErrorHandlerProvider';
import { FinnanceRouter } from './routes/Router';
import theme from './theme';


function App() {
    const preferredColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = useState<ColorScheme>(preferredColorScheme);
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={{ ...theme, colorScheme }} withGlobalStyles withNormalizeCSS>
                <ErrorModalProvider>
                    <AuthProvider>
                        <RouterProvider router={FinnanceRouter} />
                    </AuthProvider>
                </ErrorModalProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}

export default App;
