import { createBrowserRouter, Outlet } from "react-router-dom";
import LoaderError from "../components/LoaderError";
import { LoginForm } from "../components/LoginForm";
import AccountPage from "../pages/Account";
import AdminPage from "../pages/Admin";
import DashboardPage from "../pages/Dashboard";
import Layout from "../pages/Layout";
import LogoutPage from "../pages/Logout";
import { PrivateRoute, StrictPublicRoute } from "./Route";

export const FinnanceRouter = createBrowserRouter([
    {
        element: <Layout />,
        errorElement: <LoaderError />,
        action: () => "doing update",
        children: [{
            element: <StrictPublicRoute />,
            children: [{
                path: "login",
                element: <LoginForm />
            }]
        }, {
            element: <PrivateRoute />,
            children: [{
                index: true,
                element: <DashboardPage />,
            }, {
                path: "admin",
                element: <AdminPage />
            }, {
                path: "logout",
                element: <LogoutPage />
            }, {
                path: "accounts/:id",
                element: <AccountPage />,
            }]
        }]
    }
]);