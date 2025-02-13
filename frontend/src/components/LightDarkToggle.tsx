import { ActionIcon, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { TbMoon, TbSun } from "react-icons/tb";

export function LightDarkToggle() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();
    return (
        <ActionIcon
          onClick={() => toggleColorScheme()}
          style={{
            backgroundColor:
              colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            color: colorScheme === 'dark' ? theme.colors.yellow[4] : theme.colors.blue[6],
          }}
        >
          {colorScheme === 'dark' ? <TbSun size={18} /> : <TbMoon size={18} />}
        </ActionIcon>
    );
  }