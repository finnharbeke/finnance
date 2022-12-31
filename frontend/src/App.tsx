import * as React from 'react';
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { RouterProvider } from "react-router-dom";
import { FinnanceRouter } from './Router';
import theme from './theme'
import AuthProvider from './contexts/AuthProvider';


function App() {
    const preferredColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = React.useState<ColorScheme>(preferredColorScheme);
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    theme.colorScheme = colorScheme

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
                <AuthProvider>
                    <RouterProvider router={FinnanceRouter} />
                </AuthProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}

export default App;
