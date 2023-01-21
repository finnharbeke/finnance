import { DefaultMantineColor, Tuple } from '@mantine/core';
import { MantineThemeOverride } from "@mantine/styles";

type ExtendedCustomColors = DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, Tuple<string, 10>>;
  }
}

const theme: MantineThemeOverride = {
  colors: {
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