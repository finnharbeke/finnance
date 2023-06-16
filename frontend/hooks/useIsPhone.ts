import { useOs } from "@mantine/hooks";

export default function useIsPhone() {
    const os = useOs();
    return os === 'ios' || os === 'android';
}