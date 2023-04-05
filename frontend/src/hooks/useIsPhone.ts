import { useOs } from "@mantine/hooks";

export default function useIsPhone() {
    // const theme = useMantineTheme();
    // return useMediaQuery(theme.fn.smallerThan('xs').replace('@media ', ''));
    const os = useOs();
    return os === 'ios' || os === 'android';
}