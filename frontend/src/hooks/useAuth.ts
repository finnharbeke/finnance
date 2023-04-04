import { useContext } from "react";
import { AuthContext } from "../contexts/AuthProvider";

export default function useAuth() {
    return useContext(AuthContext);
};