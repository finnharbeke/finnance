import { MantineThemeOverride } from "@mantine/styles";
import { Tuple, DefaultMantineColor } from '@mantine/core';

type ExtendedCustomColors = 'purple' | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, Tuple<string, 10>>;
  }
}

const theme: MantineThemeOverride = {
    colors: {
        purple: [
            "#F3E5F5",
            "#E1BEE7",
            "#CE93D8",
            "#BA68C8",
            "#AB47BC",
            "#9C27B0",
            "#8E24AA",
            "#7B1FA2",
            "#6A1B9A",
            "#4A148C"
        ]
    },
    primaryColor: 'violet',
}

export default theme;