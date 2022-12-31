import { ReactNode, useState } from "react";
import {
    createRoutesFromElements, Navigate, Route,
    useLocation
} from "react-router";
import { createBrowserRouter } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import NotFound from "./pages/404";
import AdminPage from "./pages/Admin";
import DashboardPage, { loader as dashboardLoader } from "./pages/Dashboard";
import Layout from "./pages/Layout";
import { LoginForm } from "./components/LoginForm";
import LogoutPage from "./pages/Logout";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <>
        {children}
    </>;
};

const routes = (

    <Route element={<Layout />}>
        {/* <Route index element={<HomePage />}></Route> */}
        <Route path="login" element={<LoginForm />}></Route>
        <Route path="admin" element={
            <ProtectedRoute>
                <AdminPage />
            </ProtectedRoute>
        }></Route>
        <Route index element={
            <ProtectedRoute>
                <DashboardPage />
            </ProtectedRoute>
        } loader={dashboardLoader}></Route>
        <Route path="logout" element={
            <ProtectedRoute>
                <LogoutPage />
            </ProtectedRoute>}></Route>
        <Route path="*" element={<NotFound />}></Route>
    </Route>

);

export const FinnanceRouter = createBrowserRouter(
    createRoutesFromElements(routes)
);