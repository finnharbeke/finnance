import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from "react-router-dom";
import { queryClient } from './query';
import { FinnanceRouter } from './routes/Router';
import { useCustomTheme } from './theme';
import FinnanceModalProvider from './contexts/ModalProvider';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/nprogress/styles.css';
import '@mantine/spotlight/styles.css';


function App() {
    const theme = useCustomTheme();

    return (
        <MantineProvider theme={theme} defaultColorScheme='auto'>
            <Notifications />
            <QueryClientProvider client={queryClient}>
                <FinnanceModalProvider>
                    <RouterProvider router={FinnanceRouter} />
                </FinnanceModalProvider>
            </QueryClientProvider>
        </MantineProvider>
    );
}

export default App;
