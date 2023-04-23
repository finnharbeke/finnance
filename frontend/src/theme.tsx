import { DefaultMantineColor, Tuple } from '@mantine/core';
import { MantineThemeOverride } from "@mantine/styles";
import { DateTime } from 'luxon';
import useIsPhone from './hooks/useIsPhone';

type ExtendedCustomColors = DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, Tuple<string, 10>>;
  }
}

export const useCustomTheme: () => MantineThemeOverride = () => {
  const isPhone = useIsPhone();
  return {
    colors: {
    },
    primaryColor: 'violet',
    primaryShade: { light: 4, dark: 8 },
    headings: {
      fontWeight: 250,
    },
    spacing: {
      xs: '6pt'
    },
    components: {
      DateInput: {
        defaultProps: {
          placeholder: "dd.mm.yyyy",
          valueFormat: "DD.MM.YYYY",
          clearable: false,
          dateParser: (dateString: string) => {
            return DateTime.fromFormat(dateString, 'dd.MM.yyyy').toJSDate()
          },
          size: isPhone ? 'md' : 'sm'
        },
      },
      DatePickerInput: {
        defaultProps: {
          placeholder: "dd.mm.yyyy",
          valueFormat: "DD.MM.YYYY",
          clearable: false,
          dateParser: (dateString: string) => {
            return DateTime.fromFormat(dateString, 'dd.MM.yyyy').toJSDate()
          },
          size: isPhone ? 'md' : 'sm'
        },
      },
      DateTimePicker: {
        defaultProps: {
          placeholder: "dd.mm.yyyy hh:mm",
          valueFormat: "DD.MM.YYYY HH:mm",
          size: isPhone ? 'md' : 'sm'
        },
      },
      Select: {
        defaultProps: {
          searchable: true,
          clearable: true,
          size: isPhone ? 'md' : 'sm'
        },
      },
      TextInput: {
        defaultProps: {
          size: isPhone ? 'md' : 'sm'
        }
      },
      NumberInput: {
        defaultProps: {
          size: isPhone ? 'md' : 'sm'
        }
      },
      Autocomplete: {
        defaultProps: {
          size: isPhone ? 'md' : 'sm'
        }
      },
      PasswordInput: {
        defaultProps: {
          size: isPhone ? 'md' : 'sm'
        }
      },
      ColorInput: {
        defaultProps: {
          size: isPhone ? 'md' : 'sm'
        }
      },
      TimeInput: {
        defaultProps: {
          size: isPhone ? 'md' : 'sm'
        }
      },
      Button: {
        defaultProps: {
          size: isPhone ? 'md' : 'sm'
        }
      },
      Switch: {
        defaultProps: {
          size: 'xl'
        }
      }
    }
  }
}