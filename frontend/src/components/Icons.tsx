import { ActionIcon, ActionIconProps, PolymorphicComponentProps, Tooltip, useComputedColorScheme, useMantineTheme } from "@mantine/core";
import { IconType } from "react-icons/lib";

interface IconProps extends PolymorphicComponentProps<"button", ActionIconProps> {
    iconSize?: number
    tooltip?: string
    icon: IconType
}

export function MyIcon({ icon, tooltip, iconSize = 20, ...others }: IconProps) {
    if (!tooltip)
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
    const colorScheme = useComputedColorScheme();
    return <MyIcon
        color="red"
        variant={colorScheme === 'light' ? 'outline' : 'light'}
        {...props}
    />
}

export function PrimaryIcon(props: IconProps) {
    const theme = useMantineTheme();
    return <MyIcon color={theme.primaryColor}
        variant='filled'
        {...props}
    />
}

export function SecondaryIcon(props: IconProps) {
    return <MyIcon
        variant='transparent'
        {...props}
    />
}