import { Group } from "@mantine/core"
import { DateInput, DatePickerInput, TimeInput } from "@mantine/dates"
import { UseFormReturnType } from "@mantine/form"
import { DateTime } from "luxon"
import useIsPhone from "../../hooks/useIsPhone"

interface DateTimeFormValues {
    date: Date
    time: string
}
interface DateTimeInputProps<T extends DateTimeFormValues> {
    form: UseFormReturnType<T, any>
    minDate?: Date
}

export default function DateTimeInput<T extends DateTimeFormValues>({ minDate, form }: DateTimeInputProps<T>) {
    const isPhone = useIsPhone();
    return <Group grow align='flex-start'>
        {isPhone ?
            <DatePickerInput
                label="date" withAsterisk popoverProps={{ withinPortal: true }}
                minDate={minDate}
                maxDate={DateTime.now().toJSDate()}
                {...form.getInputProps('date')}
            />
            :
            <DateInput
                label="date" withAsterisk popoverProps={{ withinPortal: true }}
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