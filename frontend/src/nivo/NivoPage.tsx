
import { Group, Stack, Tabs, Title } from "@mantine/core";
import { useState } from "react";
import { TbCalendar } from "react-icons/tb";
import CurrencyInput from "../components/input/CurrencyInput";
import { Monthly } from "./Monthly";
import { Yearly } from "./Yearly";

export default function NivoPage() {

    const [currency_id, setCurrency] = useState<string | null>(null)

    return <Stack>
        <Group justify='space-between'>
            <Title>
                analytics
            </Title>
            <CurrencyInput hasDefault maw={150}
                value={currency_id} onChange={setCurrency}
            />
        </Group>
        <Tabs defaultValue={'monthly'}>
            <Tabs.List justify='flex-end' mb='sm'>
                <Tabs.Tab value='monthly' leftSection={<TbCalendar size='1.5rem' />} />
                <Tabs.Tab value='yearly' leftSection='365' />
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