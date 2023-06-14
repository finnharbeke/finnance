import { Button } from '@mantine/core';
import { useRouter } from 'next/router';

export function BackButton() {
    const router = useRouter();
    return <Button
        variant='light'
        fullWidth
        onClick={() => router.back()}
    >
        back
    </Button>
}

export function ReloadButton() {
    const router = useRouter();
    return <Button
        variant='light'
        fullWidth
        onClick={() => router.reload()}
    >
        reload
    </Button>
}
