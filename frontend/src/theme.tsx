import { createTheme, DefaultMantineColor, MantineColor, MantineColorsTuple, MantineThemeOverride } from '@mantine/core';
import { DateTime } from 'luxon';
import { useMediaQuery } from '@mantine/hooks';

type ExtendedCustomColors = DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>;
  }
  export interface MantineThemeOther {
    colors: {
      flow: MantineColor
      transfer: MantineColor
      quick: MantineColor
      expense: MantineColor
      income: MantineColor
    }
  }
}

export const useCustomTheme = (): MantineThemeOverride => {
  const smaller_screen = useMediaQuery('(max-width: 36em)')
  return createTheme({
    colors: {
      dark: [
        '#C1C2C5',
        '#A6A7AB',
        '#909296',
        '#5c5f66',
        '#373A40',
        '#2C2E33',
        '#25262b',
        '#1A1B1E',
        '#141517',
        '#101113',
      ],
    },
    primaryColor: 'violet',
    primaryShade: { light: 4, dark: 8 },
    headings: {
      fontWeight: '250',
    },
    spacing: {
      xxxs: '1pt',
      xxs: '3pt',
      xs: '6pt'
    },
    defaultRadius: 'sm',
    other: {
      colors: {
        flow: 'grape',
        transfer: 'grape',
        quick: 'indigo',
        expense: 'red',
        income: 'blue',
      }
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
          size: smaller_screen ? 'md' : 'sm'
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
          size: smaller_screen ? 'md' : 'sm'
        },
      },
      DateTimePicker: {
        defaultProps: {
          placeholder: "dd.mm.yyyy hh:mm",
          valueFormat: "DD.MM.YYYY HH:mm",
          size: smaller_screen ? 'md' : 'sm'
        },
      },
      Select: {
        defaultProps: {
          searchable: true,
          clearable: true,
          size: smaller_screen ? 'md' : 'sm'
        },
      },
      TextInput: {
        defaultProps: {
          size: smaller_screen ? 'md' : 'sm'
        }
      },
      NumberInput: {
        defaultProps: {
          size: smaller_screen ? 'md' : 'sm'
        }
      },
      Autocomplete: {
        defaultProps: {
          size: smaller_screen ? 'md' : 'sm'
        }
      },
      PasswordInput: {
        defaultProps: {
          size: smaller_screen ? 'md' : 'sm'
        }
      },
      ColorInput: {
        defaultProps: {
          size: smaller_screen ? 'md' : 'sm',
          disallowInput: smaller_screen
        }
      },
      TimeInput: {
        defaultProps: {
          size: smaller_screen ? 'md' : 'sm'
        }
      },
      Button: {
        defaultProps: {
          size: smaller_screen ? 'md' : 'sm'
        }
      },
      Switch: {
        defaultProps: {
          size: 'xl'
        }
      },
      Modal: {
        defaultProps: {
          size: 'lg',
          fullScreen: smaller_screen,
        }
      },
      ActionIcon: {
        defaultProps: {
          size: 'lg',
        }
      },
      Paper: {
        defaultProps: {
          withBorder: true,
        }
      }
    }
  })
}