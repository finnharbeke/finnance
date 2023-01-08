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
    ],
    cinnabar: [
        "#fceae9",
        "#f6bfbc",
        "#f0958f",
        "#ea6b62",
        "#e44035",
        "#ca271b",
        "#9d1e15",
        "#70160f",
        "#430d09",
        "#160403"
    ],
    turquoise: [
        "#e9fafc",
        "#bceff6",
        "#8fe5f0",
        "#62daea",
        "#35d0e4",
        "#1bb6ca",
        "#158e9d",
        "#0f6570",
        "#093d43",
        "#031416"
    ],
  },
  primaryColor: 'violet',

  headings: {
    fontWeight: 300,  
    sizes: {
      h1: {
        fontSize: 48
      }
    }
  },
  spacing: {
    xs: 8
  }
}

export default theme;