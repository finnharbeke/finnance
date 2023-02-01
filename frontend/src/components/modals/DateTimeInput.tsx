import { Group } from "@mantine/core"
import { DatePicker, TimeInput } from "@mantine/dates"
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
    <DatePicker
        data-autofocus label="date" placeholder="dd.mm.yyyy" withAsterisk
        inputFormat="DD.MM.YYYY" clearable={false}
        minDate={DateTime.fromISO(minDate).toJSDate()}
        maxDate={DateTime.now().toJSDate()}
        allowFreeInput dateParser={(dateString: string) => {
            return DateTime.fromFormat(dateString, 'dd.MM.yyyy').toJSDate()
        }}
        {...form.getInputProps('date')}
    />
    <TimeInput
        defaultValue={new Date()}
        label="time"
        withAsterisk
        {...form.getInputProps('time')}
    />
</Group>
}