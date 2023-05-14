import { ActionIcon, Group, Paper, SimpleGrid, Text } from "@mantine/core";
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

    return <SimpleGrid breakpoints={[
        { minWidth: 'xs', cols: 2 },
        { minWidth: 'md', cols: 3 },
    ]}>
        {
            query.data.map((temp, i) =>
                <TemplatePill key={i} template={temp} />
            )
        }
    </SimpleGrid>
}

const TemplatePill = ({ template }: { template: TemplateDeepQueryResult }) => {
    const deleteTemplate = useDeleteTemplate(template.id);

    return <Paper p='xs'>
        <Group noWrap align='center' spacing='xs'>
            <ActionIcon onClick={() => addTransactionAction({ template })}
                variant='light' color='indigo'>
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