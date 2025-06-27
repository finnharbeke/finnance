import { Button } from "@mantine/core";
import { useState } from "react";
import { addAccountAction } from "../../actions/actions";

export default function AccountButton() {
    const [loading, setLoading] = useState(false);
    return <Button fullWidth mt='sm' loading={loading}
        onClick={() => {
            setLoading(true);
            addAccountAction().then(
                () => setLoading(false)
            )
        }}
    >
        create account</Button>
}