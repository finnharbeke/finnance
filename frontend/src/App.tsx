import * as React from 'react';
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { RouterProvider } from "react-router-dom";
import { FinnanceRouter } from './routes/Router';
import theme from './theme'
import AuthProvider from './contexts/AuthProvider';
import ErrorModalProvider from './contexts/ErrorHandlerProvider';


function App() {
    const preferredColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = React.useState<ColorScheme>(preferredColorScheme);
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    theme.colorScheme = colorScheme

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
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
