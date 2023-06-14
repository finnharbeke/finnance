
import { Group, Stack, Tabs, Title } from "@mantine/core";
import { useState } from "react";
import { TbCalendar } from "react-icons/tb";
import CurrencyInput from "../components/input/CurrencyInput";
import { Monthly } from "../nivo/Monthly";
import { Yearly } from "../nivo/Yearly";

export default function NivoPage() {

    const [currency_id, setCurrency] = useState<string | null>(null)

    return <Stack>
        <Group position='apart'>
            <Title>
                analytics
            </Title>
            <CurrencyInput hasDefault maw={150}
                value={currency_id} onChange={setCurrency}
            />
        </Group>
        <Tabs defaultValue={'monthly'}>
            <Tabs.List position='right' mb='sm'>
                <Tabs.Tab value='monthly' icon={<TbCalendar size='1.5rem' />} />
                <Tabs.Tab value='yearly' icon='365' />
            </Tabs.List>
            <Tabs.Panel value='monthly'>
                <Monthly currency_id={currency_id} />
            </Tabs.Panel>
            <Tabs.Panel value='yearly'>
                <Yearly currency_id={currency_id} />
            </Tabs.Panel>
        </Tabs>
    </Stack>
}
