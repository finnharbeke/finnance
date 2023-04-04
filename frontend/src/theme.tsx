import { DefaultMantineColor, Tuple } from '@mantine/core';
import { MantineThemeOverride } from "@mantine/styles";
import { DateTime } from 'luxon';

type ExtendedCustomColors = DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, Tuple<string, 10>>;
  }
}

const InputSize = "md";

const theme: MantineThemeOverride = {
  colors: {
  },
  primaryColor: 'violet',

  headings: {
    fontWeight: 250,
  },
  spacing: {
    xs: '6pt'
  },
  components: {
    DatePickerInput: {
      defaultProps: {
        placeholder: "dd.mm.yyyy",
        inputFormat: "DD.MM.YYYY",
        clearable: false,
        allowFreeInput: true,
        dateParser: (dateString: string) => {
          return DateTime.fromFormat(dateString, 'dd.MM.yyyy').toJSDate()
        },
        size: InputSize
      },
    },
    Select: {
      defaultProps: {
        searchable: true,
        clearable: true,
        size: InputSize
      },
    },
    TextInput: {
      defaultProps: {
        size: InputSize
      }
    },
    NumberInput: {
      defaultProps: {
        size: InputSize
      }
    },
    Autocomplete: {
      defaultProps: {
        size: InputSize
      }
    },
    InputWrapper: {
      defaultProps: {
        size: InputSize
      }
    },
  }
}

export default theme;