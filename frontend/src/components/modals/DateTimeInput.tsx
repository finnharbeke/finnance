import { Group } from "@mantine/core"
import { DateInput, DatePickerInput, TimeInput } from "@mantine/dates"
import { UseFormReturnType } from "@mantine/form"
import { DateTime } from "luxon"
import useIsPhone from "../../hooks/useIsPhone"
import { FormValues, transformedFormValues } from "./TransactionModal"

interface DateTimeInputProps {
    form: UseFormReturnType<FormValues, (vals: FormValues) => transformedFormValues>
    minDate?: Date
}

export default function DateTimeInput({ minDate, form }: DateTimeInputProps) {
    const isPhone = useIsPhone();
    return <Group grow align='flex-start'>
        {isPhone ?
            <DatePickerInput
                data-autofocus label="date" withAsterisk
                minDate={minDate}
                maxDate={DateTime.now().toJSDate()}
                {...form.getInputProps('date')}
            />
            :
            <DateInput
                data-autofocus label="date" withAsterisk
                minDate={minDate}
                maxDate={DateTime.now().toJSDate()}
                {...form.getInputProps('date')}
            />
        }
        <TimeInput
            label="time"
            withAsterisk
            {...form.getInputProps('time')}
        />
    </Group>
}