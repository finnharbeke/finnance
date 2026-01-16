import { ActionIcon, Group, Stack, Title, useMantineTheme } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { TbChevronDown, TbChevronUp, TbSortDescending2 } from "react-icons/tb"
import { DataPill } from "../components/DataPill"
import Placeholder from "../components/Placeholder"
import useAmount from "../hooks/useAmount"
import useIsPhone from "../hooks/useIsPhone"
import { getAxiosData, searchParams } from "../query"
import { CategoryQueryResult } from "../types/Category"
import { CurrencyQueryResult, useCurrency } from "../types/Currency"
import { LineSkeleton } from "./ExpIncLine"
import { NivoComponentProps, NivoRequest } from "./Nivo"

interface CategoryData {
    category: CategoryQueryResult
    total: number
    children: CategoryData[]
}

const useCategoriesQuery = (props: NivoRequest) =>
    useQuery<CategoryData[], AxiosError>({
        queryKey: ["categories", "changes", props],
        queryFn: () => getAxiosData(`/api/nivo/categories?${searchParams(props)}`)
    });

export const CategoryPills = ({ request, size }: NivoComponentProps) => {
    const isPhone = useIsPhone();
    const theme = useMantineTheme();
    const [sorted, { toggle }] = useDisclosure(false);
    const currency = useCurrency(request.currency_id);

    const query = useCategoriesQuery(request);
    const [data, setData] = useState<CategoryData[]>()
    useEffect(() => query.data && setData(query.data), [query.data, setData])

    if (query.isError || currency.isError)
        return <Placeholder queries={[query]} height={size.height} />
    if (data === undefined || currency.isLoading)
        return <LineSkeleton {...size} />

    return <>
        <Group justify='space-between' my='sm'>
            <Title order={3}>{
                request.is_expense ? 'expenses' : 'income'
            }</Title>
            <ActionIcon size={isPhone ? 'xl' : 'lg'}
                onClick={toggle}
                variant={sorted ? 'filled' : undefined}
                color={sorted ? theme.primaryColor : undefined}
            >
                <TbSortDescending2 size={isPhone ? '1.3rem' : '1.5rem'} />
            </ActionIcon>
        </Group>
        <CategoryPillStack data={data} sorted={sorted} currency={currency.data} />

    </>
}

interface CategoryPillStackProps {
    data: CategoryData[]
    currency: CurrencyQueryResult
    sorted: boolean
    indent?: boolean
}

const CategoryPillStack = ({ data, sorted, currency, indent = false }: CategoryPillStackProps) =>
    <Stack ml={indent ? 'xl' : undefined} gap={0}>
        {
            data.sort((a, b) => sorted ? b.total - a.total : a.category.order - b.category.order).map((pill, i) =>
                <CategoryPill currency={currency} sorted={sorted} data={pill} key={i} />
            )
        }
    </Stack >

interface CategoryPillProps {
    data: CategoryData
    currency: CurrencyQueryResult
    sorted: boolean
}

const CategoryPill = ({ data: { category, children, total }, currency, sorted }: CategoryPillProps) => {
    const amount = useAmount(total, currency);
    const [down, { toggle }] = useDisclosure(false)
    return <>
        <DataPill cells={[
            {
                type: 'icon',
                col: {
                    span: {base: 3, sm: 1}
                },
                cell: {
                    icon: () => <></>,
                    style: { backgroundColor: category.color, height: '100%' }
                }
            },
            {
                type: 'text',
                col: {
                    span: {base: 8, sm: 8}
                },
                cell: {
                    text: category.desc,
                    align: 'left'
                }
            },
            {
                type: 'text',
                col: {
                    span: {base: 10, sm: 14}
                },
                cell: {
                    text: amount,
                    align: 'right',
                }
            },
            {
                type: 'icon',
                col: {
                    span: {base: 3, sm: 1}
                },
                cell: {
                    icon: children.length ? (down ? TbChevronUp : TbChevronDown) : () => <></>,
                    onClick: toggle,
                    style: { height: '100%' }
                }
            },
        ]} />
        {
            children.length > 0 && down &&
            <CategoryPillStack data={children} indent sorted={sorted} currency={currency} />
        }
    </>
}