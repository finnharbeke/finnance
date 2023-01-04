import { useContext } from "react";
import { ErrorHandlerContext } from "../contexts/ErrorHandlerProvider";

export default function useAuth() {
    return useContext(ErrorHandlerContext);
};