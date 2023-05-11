import { Container } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import FinnanceHeader from '../components/FinnanceHeader';
import { FinnanceSpotlight } from '../actions/Spotlight';
import FinnanceModalProvider from '../contexts/ModalProvider';

export default function Layout() {
    return <FinnanceModalProvider>
        <FinnanceSpotlight>
            <FinnanceHeader />
            <Container my='lg'>
                <Outlet />
            </Container>
        </FinnanceSpotlight>
    </FinnanceModalProvider>
}