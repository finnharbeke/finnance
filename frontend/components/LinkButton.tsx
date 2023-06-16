import Link from 'next/link';
import { Button, ButtonProps } from '@mantine/core';

interface LinkButtonProps extends ButtonProps {
    to: string, label: string
}

export default function LinkButton({ to, label, ...others }: LinkButtonProps) {
    // return <Link href={to} key={label} className={classes.linkButton}>{label}</Link>
    return <Button
        variant='light'
        radius='xl'
        fullWidth
        component={Link} href={to} key={label}
        {...others}
        >
            {label}
    </Button>
}
