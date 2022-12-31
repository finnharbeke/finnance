import { Link } from 'react-router-dom';
import { Button } from '@mantine/core';

interface LinkButtonProps {
    to: string, label: string
}

export default function LinkButton(props: LinkButtonProps) {
    const { to, label } = props;
    // return <Link to={to} key={label} className={classes.linkButton}>{label}</Link>
    return <Button
        variant='light'
        radius='xl'
        fullWidth
        component={Link} to={to} key={label}>
            {label}
    </Button>
}