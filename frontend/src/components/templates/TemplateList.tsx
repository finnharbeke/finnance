import { ActionIcon, Group, Paper, SimpleGrid, Text, useMantineTheme } from "@mantine/core";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { TbEraser } from "react-icons/tb";
import { addTransactionAction } from "../../actions/actions";
import { TemplateDeepQueryResult, useDeleteTemplate, useTemplates } from "../../types/Template";
import { RedIcon } from "../Icons";
import Placeholder from "../Placeholder";

export const TemplateList = () => {
    const query = useTemplates();

    if (!query.isSuccess)
        return <Placeholder height={300} queries={[query]} />

    return <SimpleGrid cols={{base: 2, md: 3}}>
        {
            query.data.map((temp, i) =>
                <TemplatePill key={i} template={temp} />
            )
        }
    </SimpleGrid>
}

const TemplatePill = ({ template }: { template: TemplateDeepQueryResult }) => {
    const theme = useMantineTheme();
    const deleteTemplate = useDeleteTemplate(template.id);

    return <Paper p='xs'>
        <Group wrap='nowrap' align='center' gap='xs'>
            <ActionIcon onClick={() => addTransactionAction({ template })}
                variant='light' color={theme.other.colors.quick}>
                <AiOutlineThunderbolt size={24} />
            </ActionIcon>
            <Text style={{flexGrow: 1}} lineClamp={1}>
                {template.desc}
            </Text>
            <RedIcon onClick={() => deleteTemplate.mutate()}
                variant='light' icon={TbEraser} />
        </Group>
    </Paper>

}