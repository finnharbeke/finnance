import { createTheme, DefaultMantineColor, MantineColor, MantineColorsTuple, MantineThemeOverride } from '@mantine/core';
import { DateTime } from 'luxon';
import useIsPhone from './hooks/useIsPhone';
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
  const isPhone = useIsPhone();
  const fullscreen = useMediaQuery('(max-width: --mantine-breakpoint-xs)')
  return createTheme({
    colors: {
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
          size: isPhone ? 'md' : 'sm',
          disallowInput: isPhone
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
      },
      Modal: {
        defaultProps: {
          size: 'lg',
          fullScreen: fullscreen,
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