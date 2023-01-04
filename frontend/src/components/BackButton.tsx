import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';

export default function BackButton() {
    // return <Link to={to} key={label} className={classes.linkButton}>{label}</Link>
    const label = "back";
    const navigate = useNavigate();
    return <Button
        variant='light'
        radius='xl'
        fullWidth
        key={label}
        onClick={() => navigate(-1)}>
            {label}
    </Button>
}