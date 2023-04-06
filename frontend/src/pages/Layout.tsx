import { Container } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import FinnanceHeader from '../components/FinnanceHeader';
import FinnanceModalProvider from '../contexts/ModalProvider';

export default function Layout() {
    return (
        <FinnanceModalProvider>
            <FinnanceHeader />
            <Container my='lg'>
                <Outlet />
            </Container>
        </FinnanceModalProvider>
    )
}