import { createBrowserRouter } from "react-router-dom";
import LoaderError from "../components/LoaderError";
import { LoginForm } from "../components/LoginForm";
import { SignUpForm } from "../components/SignUpForm";
import NotFound from "../pages/404";
import AccountPage from "../pages/Account";
import AccountsPage from "../pages/Accounts";
import DashboardPage from "../pages/Dashboard";
import Layout from "../pages/Layout";
import LogoutPage from "../pages/Logout";
import { PrivateRoute, StrictPublicRoute } from "./Route";

export const FinnanceRouter = createBrowserRouter([
    {
        element: <Layout />,
        children: [{
            element: <StrictPublicRoute />,
            errorElement: <LoaderError />,
            children: [{
                path: "login",
                element: <LoginForm />
            }, {
                path: "register",
                element: <SignUpForm />
            }]
        }, {
            element: <PrivateRoute />,
            errorElement: <LoaderError />,
            children: [{
                index: true,
                element: <DashboardPage />,
            }, {
                path: "logout",
                element: <LogoutPage />
            }, {
                path: "accounts/:id",
                element: <AccountPage />,
            }, {
                path: "accounts",
                element: <AccountsPage />
            }]
        }, {
            path: "*",
            element: <NotFound/>
        }]
    }
]);