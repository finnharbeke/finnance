import { Group } from "@mantine/core"
import { DatePickerInput, TimeInput } from "@mantine/dates"
import { UseFormReturnType } from "@mantine/form"
import { DateTime } from "luxon"
import { FormValues, transformedFormValues } from "./Transaction"

interface DateTimeInputProps {
    form: UseFormReturnType<FormValues, (vals: FormValues) => transformedFormValues>
    minDate?: string
}

export default function DateTimeInput(props: DateTimeInputProps) {
    const { minDate, form } = props;
    return <Group grow align='flex-start'>
    <DatePickerInput
        data-autofocus label="date" withAsterisk
        minDate={minDate === undefined ? undefined : DateTime.fromISO(minDate).toJSDate()}
        maxDate={DateTime.now().toJSDate()}
        {...form.getInputProps('date')}
    />
    <TimeInput
        label="time"
        withAsterisk
        {...form.getInputProps('time')}
    />
</Group>
}