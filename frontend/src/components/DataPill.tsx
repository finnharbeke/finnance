import { Center, ColProps, Grid, GridProps, Loader, MantineColor, Popover, Text, Tooltip, createStyles } from "@mantine/core";
import { useRef, useState } from "react";
import { IconType } from "react-icons";
import { TbPencil } from "react-icons/tb";
import { Link } from "react-router-dom";
import { useIsOverflow } from "../hooks/useIsOverflow";
import useIsPhone from "../hooks/useIsPhone";

const useStyles = createStyles(theme => ({
    pill: {
        backgroundColor: theme.colorScheme === 'light' ?
            theme.colors['gray'][1] : theme.colors['gray'][8],
        marginLeft: 0,
        marginRight: 0,
        borderRadius: theme.fn.radius(),
        '& > * > *': {
            height: '2rem',
            paddingLeft: theme.spacing.xs,
            paddingRight: theme.spacing.xs,
            borderRadius: theme.fn.radius(),
            backgroundColor: theme.colorScheme === 'light' ?
                theme.white : theme.colors['gray'][9],
        }
    },
    edit: {
        '&:hover': {
            backgroundColor: theme.colorScheme === 'light' ?
                theme.colors['gray'][0] : theme.colors['dark'][7],
        },
        '&:active': {
            paddingTop: 2
        },

    },
    textCell: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        width: '100%'
    },
}))

export interface DataPillTextCellProps {
    col: ColProps
    cell: TextCellProps
    type: 'text'
}

export interface DataPillEditCellProps {
    col: ColProps
    cell: EditCellProps
    type: 'edit'
}

export interface DataPillIconCellProps {
    col: ColProps
    cell: IconCellProps
    type: 'icon'
}

interface DataPillProps extends Omit<GridProps, 'children'> {
    cells: (DataPillEditCellProps | DataPillIconCellProps | DataPillTextCellProps)[]
}

export const DataPill = ({ cells, ...props }: DataPillProps) => {
    const isPhone = useIsPhone();
    const { classes: { pill } } = useStyles();
    return <Grid gutter={2} p={1} columns={24}
        mb={isPhone ? 'sm' : 'xs'} className={pill}
        {...props}>
        {
            cells.map(({ col, type, cell }, i) => <Grid.Col {...col}>
                {
                    type === 'text' ?
                        <TextCell {...cell} />
                        :
                        type === 'icon' ?
                            <IconCell {...cell} />
                            :
                            <EditCell {...cell} />
                }
            </Grid.Col>)
        }
    </Grid>
}

interface TextCellProps {
    align: AlignSetting
    text: string
    color?: MantineColor
    link?: string
}

const TextCell = ({ align, text, color, link }: TextCellProps) => {
    const isPhone = useIsPhone();
    const ref = useRef<HTMLDivElement>(null);
    const over = useIsOverflow(ref, text);
    const { classes: { textCell } } = useStyles();
    const content =
        <Text ref={ref} className={textCell} align={align} color={color}>
            {
                link === undefined ?
                text : <Text component={Link} to={link} color={color}>{text}</Text>
            }
        </Text>
    const w = 250;
    return <Center>{
        isPhone ?
            <Popover disabled={!over} width={w}>
                <Popover.Target>
                    {content}
                </Popover.Target>
                <Popover.Dropdown>
                    {text}
                </Popover.Dropdown>
            </Popover>
            :
            <Tooltip label={text} disabled={!over} multiline width={w}>
                {content}
            </Tooltip>
    }</Center>
}

interface EditCellProps {
    onEdit: () => Promise<void>
}

const EditCell = ({ onEdit }: EditCellProps) => {
    const [loading, setLoading] = useState(false);
    const { classes: { edit } } = useStyles();
    return <Center className={edit} onClick={() => {
        setLoading(true);
        onEdit().finally(() => setLoading(false));
    }}>
        {
            loading ?
                <Loader />
                :
                <TbPencil size={24} />
        }
    </Center>
}

interface IconCellProps {
    style: React.CSSProperties
    icon: IconType
}

const IconCell = ({ style, icon }: IconCellProps) =>
    <Center style={style}>
        {icon({ size: 24 })}
    </Center>