import { ActionIcon } from "@mantine/core";
import { useMantineColorScheme } from "@mantine/styles";
import { TbMoon, TbSun } from "react-icons/tb";

export function LightDarkToggle() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  
    return (
        <ActionIcon
          onClick={() => toggleColorScheme()}
          size="lg"
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            color: theme.colorScheme === 'dark' ? theme.colors.yellow[4] : theme.colors.blue[6],
          })}
        >
          {colorScheme === 'dark' ? <TbSun size={18} /> : <TbMoon size={18} />}
        </ActionIcon>
    );
  }