import { ActionIcon, ActionIconProps, Tooltip, useMantineTheme } from "@mantine/core";
import { PolymorphicComponentProps } from "@mantine/utils";
import { forwardRef, ReactNode } from "react";
import { IconType } from "react-icons/lib";

interface IconProps extends PolymorphicComponentProps<"button", ActionIconProps> {
    iconSize?: number
    tooltip?: string
    icon: IconType
}

function MyIcon({ icon, tooltip, iconSize = 20, ...others }: IconProps) {
    if (tooltip === undefined)
        return <ActionIcon {...others}>
            {icon({ size: iconSize })}
        </ActionIcon>
    else
        return <Tooltip label={tooltip}>
            <ActionIcon {...others}>
                {icon({ size: iconSize })}
            </ActionIcon>
        </Tooltip>

}

export function RedIcon (props: IconProps) {
    const theme = useMantineTheme();
    return <MyIcon
        color="red" size='lg'
        variant={theme.colorScheme === 'light' ? 'outline' : 'light'}
        {...props}
    />
}

export function PrimaryIcon(props: IconProps) {
    const theme = useMantineTheme();
    return <MyIcon size='lg' color={theme.primaryColor}
        variant='filled'//{theme.colorScheme === 'light' ? 'filled' : 'outline'}
        {...props}
    />
}

export function SecondaryIcon(props: IconProps) {
    const theme = useMantineTheme();
    return <MyIcon size='lg'// color={theme.secondaryColor}
        variant='subtle'//{theme.colorScheme === 'light' ? 'filled' : 'outline'}
        {...props}
    />
}