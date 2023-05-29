import { Center, ColProps, Grid, GridProps, MantineColor, Popover, Text, TextProps, Tooltip, createStyles, useMantineTheme } from "@mantine/core";
import { DateTime } from "luxon";
import { useRef } from "react";
import { IconType } from "react-icons";
import { TbPencil } from "react-icons/tb";
import { Link } from "react-router-dom";
import { useIsOverflow } from "../hooks/useIsOverflow";
import useIsPhone from "../hooks/useIsPhone";
import { useSmallerThan } from "../hooks/useSmallerthan";

export const useDataPillStyles = createStyles(theme => ({
    pill: {
        backgroundColor: theme.colorScheme === 'light' ?
            theme.colors['gray'][1] : theme.colors['gray'][8],
        marginLeft: 0,
        marginRight: 0,
        borderRadius: theme.fn.radius(),
        '& > * > *': {
            height: '100%',
            paddingLeft: theme.spacing.xs,
            paddingRight: theme.spacing.xs,
            paddingTop: theme.spacing.xxs,
            paddingBottom: theme.spacing.xxs,
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
            paddingTop: 4,
            paddingBottom: 0
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
    const isSm = useSmallerThan('sm');
    const { classes: { pill } } = useDataPillStyles();
    return <Grid gutter={2} p={1} columns={24} align='stretch'
        mb={isSm ? 'sm' : 'xs'} className={pill}
        {...props}>
        {
            cells.map(({ col, type, cell }, i) => <Grid.Col {...col} key={i}>
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

interface TextCellProps extends TextProps {
    align: AlignSetting
    text: string
    link?: string
    p?: string
}

const TextCell = ({ text, link, p, ...others }: TextCellProps) => {
    const isPhone = useIsPhone();
    const ref = useRef<HTMLDivElement>(null);
    const over = useIsOverflow(ref, text);
    const { classes: { textCell } } = useDataPillStyles();
    const content =
        <Text ref={ref} className={textCell} {...others}>
            {
                link === undefined ?
                    text : <Text component={Link} to={link} color={others.color}>{text}</Text>
            }
        </Text>
    const w = 250;
    return <Center style={{
        paddingTop: p, paddingBottom: p
    }}>{
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
    const { classes: { edit } } = useDataPillStyles();
    return <Center className={edit} onClick={() => onEdit()}>
        <TbPencil size={24} />
    </Center>
}

interface IconCellProps {
    style?: React.CSSProperties
    onClick?: () => void
    className?: string
    icon: IconType
}

const IconCell = ({ style, icon, onClick, className }: IconCellProps) =>
    <Center style={style} onClick={onClick} className={className}>
        {icon({ size: 24 })}
    </Center>

interface StandardPillProps {
    icon: IconType
    iconColor: MantineColor
    datetime: DateTime
    amount: string
    is_expense: boolean
    label: Omit<TextCellProps, 'align'>
    comment: string
    onEdit: () => Promise<void>
}

export const StandardPill = (props: StandardPillProps) => {
    const {
        icon, iconColor, datetime,
        amount, is_expense, label,
        comment, onEdit
    } = props;
    const theme = useMantineTheme();
    const lightIconColor = theme.fn.lighten(
        theme.colors[iconColor][theme.fn.primaryShade()],
        theme.colorScheme === 'light' ? 0.4 : 0.1
    );
    const isSm = useSmallerThan('sm');

    return <DataPill cells={[
        {
            type: 'icon',
            col: {
                span: 3, sm: 1, order: 1
            },
            cell: {
                style: { backgroundColor: lightIconColor},
                icon: icon
            }
        },
        {
            type: 'text',
            col: {
                span: 14, sm: 5, order: 2, orderSm: 3
            },
            cell: {
                align: isSm ? 'left' : 'right',
                text: amount,
                color: is_expense ? theme.other.colors.expense : theme.other.colors.income
            }
        },
        {
            type: 'text',
            col: {
                span: 7, sm: 3, order: 3, orderSm: 2
            },
            cell: {
                align: 'center',
                text: datetime.toFormat('dd.MM.yy'),
            }
        },
        {
            type: 'edit',
            col: {
                span: 3, sm: 1, order: 4, orderSm: 5
            },
            cell: { onEdit }
        },
        {
            type: 'text',
            col: {
                span: 21, sm: 14, order: 5, orderSm: 4
            },
            cell: {
                align: 'left',
                ...label
            }
        },
        {
            type: 'text',
            col: {
                span: comment === '' ? -1 : 24, order: 6
            },
            cell: {
                align: 'left',
                text: comment,
                fz: 'xs',
                c: 'dimmed',
                p: theme.spacing.xxxs
            }
        },
    ]} />
}

interface SaldoPillProps extends StandardPillProps {
    saldo: string
}

export const SaldoPill = (props: SaldoPillProps) => {
    const {
        icon, iconColor, datetime,
        amount, saldo, is_expense,
        label, comment, onEdit
    } = props;
    const theme = useMantineTheme();
    const lightIconColor = theme.fn.lighten(
        theme.colors[iconColor][theme.fn.primaryShade()],
        theme.colorScheme === 'light' ? 0.4 : 0.1
    );
    const isSm = useSmallerThan('sm');

    return <DataPill cells={[
        {
            type: 'icon',
            col: {
                span: 3, sm: 1, order: 1
            },
            cell: {
                style: { backgroundColor: lightIconColor},
                icon: icon
            }
        },
        {
            type: 'text',
            col: {
                span: 10, sm: 5, order: 2, orderSm: 3
            },
            cell: {
                align: isSm ? 'left' : 'right',
                text: amount,
                color: is_expense ? theme.other.colors.expense : theme.other.colors.income
            }
        },
        {
            type: 'text',
            col: {
                span: 11, sm: 5, order: 3, orderSm: 5
            },
            cell: {
                align: isSm ? 'left' : 'right',
                text: saldo,
            }
        },
        {
            type: 'edit',
            col: {
                span: 3, sm: 1, order: 4, orderSm: 6
            },
            cell: { onEdit }
        },
        {
            type: 'text',
            col: {
                span: 14, sm: 9, order: 5, orderSm: 4
            },
            cell: {
                align: 'left',
                ...label
            }
        },
        {
            type: 'text',
            col: {
                span: 7, sm: 3, order: 6, orderSm: 2
            },
            cell: {
                align: 'center',
                text: datetime.toFormat('dd.MM.yy'),
            }
        },
        {
            type: 'text',
            col: {
                span: comment === '' ? -1 : 24, order: 7
            },
            cell: {
                align: 'left',
                text: comment,
                fz: 'xs',
                c: 'dimmed',
                p: theme.spacing.xxxs
            }
        },
    ]} />
}

interface TwoLabelPillProps extends StandardPillProps {
    label2: Omit<TextCellProps, 'align'>
}

export const TwoLabelPill = (props: TwoLabelPillProps) => {
    const theme = useMantineTheme();
    const {
        icon, iconColor, datetime,
        amount, is_expense, label,
        label2, comment, onEdit
    } = props;
    const lightIconColor = theme.fn.lighten(
        theme.colors[iconColor][theme.fn.primaryShade()],
        theme.colorScheme === 'light' ? 0.4 : 0.1
    );
    const isSm = useSmallerThan('sm');

    return <DataPill cells={[
        {
            type: 'icon',
            col: {
                span: 3, sm: 1, order: 1
            },
            cell: {
                style: { backgroundColor: lightIconColor},
                icon: icon
            }
        },
        {
            type: 'text',
            col: {
                span: 10, sm: 4, order: 2, orderSm: 3
            },
            cell: {
                align: isSm ? 'left' : 'right',
                text: amount,
                color: is_expense ? theme.other.colors.expense : theme.other.colors.income
            }
        },
        {
            type: 'text',
            col: {
                span: 11, sm: 7, order: 3, orderSm: 5
            },
            cell: {
                align: 'left',
                ...label2
            }
        },
        {
            type: 'edit',
            col: {
                span: 3, sm: 1, order: 4, orderSm: 5
            },
            cell: { onEdit }
        },
        {
            type: 'text',
            col: {
                span: 7, sm: 3, order: 6, orderSm: 2
            },
            cell: {
                align: 'center',
                text: datetime.toFormat('dd.MM.yy'),
            }
        },
        {
            type: 'text',
            col: {
                span: 14, sm: 8, order: 5, orderSm: 4
            },
            cell: {
                align: 'left',
                ...label
            }
        },
        {
            type: 'text',
            col: {
                span: comment === '' ? -1 : 24, order: 7
            },
            cell: {
                align: 'left',
                text: comment,
                fz: 'xs',
                c: 'dimmed',
                p: theme.spacing.xxxs
            }
        },
    ]} />
}