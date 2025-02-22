import { Button, TextInput, Text, Divider } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useState } from "react";
import { TemplateRequest, useAddTemplate, useTemplateForm } from "../../types/Template";
import { TransactionFormType } from "../../types/Transaction";
import { TransactionForm } from "../transaction/TransactionModal";

export const AddTemplateModal = (
    { context, id }: ContextModalProps<{}>
) => {

    const form = useTemplateForm();

    const addTemp = useAddTemplate();

    const [loading, setLoading] = useState(false);

    const submitForm = (vals: TemplateRequest) => {
        setLoading(true);
        addTemp.mutateAsync(vals, {
            onSuccess: () => context.closeModal(id),
            onSettled: () => setLoading(false)
        });
    }

    return <form onSubmit={form.onSubmit(submitForm)}>
        <TextInput label='template name' placeholder='my migros template' withAsterisk
            {...form.getInputProps('desc')} />
        <Text size='sm' c='dimmed' mt='xs'>
            will open a transaction to add with your pre-filled values below, all fields are optional.
        </Text>
        <Divider mb='xs'/>
        {/* bad casting... */}
        <TransactionForm form={form as unknown as TransactionFormType}
            account_input={true}
            date_input={false}
            template={true}
        />
        <Button fullWidth mt="md" type='submit' loading={loading} >
            add template
        </Button>
    </form>
};