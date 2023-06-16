import { MantineNumberSize, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export function useSmallerThan(breakpoint: MantineNumberSize) {
    const theme = useMantineTheme();
    const isSm = useMediaQuery(theme.fn.smallerThan(breakpoint).replace('@media ', ''));
    return isSm;
}