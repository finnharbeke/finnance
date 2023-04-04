import { useContext } from "react";
import { ErrorHandlerContext } from "../contexts/ErrorHandlerProvider";

export default function useErrorHandler() {
    return useContext(ErrorHandlerContext);
};