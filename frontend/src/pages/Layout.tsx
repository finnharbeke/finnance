import { Container } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import FinnanceHeader from '../components/FinnanceHeader';

export default function Layout() {
    return (
        <>
            <FinnanceHeader />
            <Container my='md'>
                <Outlet />
            </Container>

        </>
    )
}