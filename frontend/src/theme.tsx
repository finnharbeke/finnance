import { DefaultMantineColor, Tuple } from '@mantine/core';
import { MantineThemeOverride } from "@mantine/styles";
import { DateTime } from 'luxon';

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
  },
  components: {
    DatePicker: {
      defaultProps: {
        placeholder: "dd.mm.yyyy",
        inputFormat: "DD.MM.YYYY",
        clearable: false,
        allowFreeInput: true,
        dateParser: (dateString: string) => {
          return DateTime.fromFormat(dateString, 'dd.MM.yyyy').toJSDate()
        }
      },
    },
    Select: {
      defaultProps: {
        searchable: true,
        clearable: true
      },
    },
  }
}

export default theme;