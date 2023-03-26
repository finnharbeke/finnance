import { useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';

export function BackButton() {
    const navigate = useNavigate();
    return <Button
        variant='light'
        fullWidth
        onClick={() => navigate(-1)}
    >
        back
    </Button>
}

export function ReloadButton() {
    const navigate = useNavigate();
    return <Button
        variant='light'
        fullWidth
        onClick={() => navigate(0)}
    >
        reload
    </Button>
}