import { Group, MantineSize } from "@mantine/core"
import { DatePickerInput, TimeInput } from "@mantine/dates"
import { UseFormReturnType } from "@mantine/form"
import { DateTime } from "luxon"
import { FormValues, transformedFormValues } from "./Transaction"

interface DateTimeInputProps {
    form: UseFormReturnType<FormValues, (vals: FormValues) => transformedFormValues>
    minDate?: Date
    size: MantineSize
}

export default function DateTimeInput({ minDate, form, size }: DateTimeInputProps) {
    return <Group grow align='flex-start'>
    <DatePickerInput
        data-autofocus label="date" withAsterisk
        minDate={minDate}
        maxDate={DateTime.now().toJSDate()}
        size={size}
        {...form.getInputProps('date')}
    />
    <TimeInput
        label="time"
        withAsterisk
        size={size}
        {...form.getInputProps('time')}
    />
</Group>
}