import { Button, Title } from "@mantine/core";
import { useState } from "react";
import { TbCirclePlus } from "react-icons/tb";
import { addTemplateAction } from "../actions/actions";
import { TemplateList } from "../components/templates/TemplateList";

export const TemplatesPage = () => {
    const [loading, setLoading] = useState(false);

    return <>
        <Title>templates</Title>
        <Button size='lg' fullWidth loading={loading} my='md'
            leftSection={<TbCirclePlus size={40} />}
            onClick={() => {
                setLoading(true);
                addTemplateAction().then(
                    () => setLoading(false)
                )
            }}>
            new template
        </Button>
        <TemplateList/>
        {/* { JSON.stringify(query.data) } */}
    </>
}