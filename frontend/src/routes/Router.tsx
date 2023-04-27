import { createBrowserRouter } from "react-router-dom";
import LoaderError from "../components/LoaderError";
import { LoginForm } from "../components/auth/LoginForm";
import NotFound from "../pages/404";
import AccountPage from "../pages/Account";
import AccountsPage from "../pages/Accounts";
import DashboardPage from "../pages/Dashboard";
import Layout from "../pages/Layout";
import LogoutPage from "../pages/Logout";
import { AuthRoute } from "./Route";
import { SignUpForm } from "../components/auth/SignUpForm";
import CategoriesPage from "../components/category/CategoriesPage";
import NivoPage from "../nivo/NivoPage";

export const FinnanceRouter = createBrowserRouter([
    {
        element: <Layout />,
        children: [{
            element: <AuthRoute private_={false} />,
            errorElement: <LoaderError />,
            children: [{
                path: "login",
                element: <LoginForm />
            }, {
                path: "register",
                element: <SignUpForm />
            }]
        }, {
            element: <AuthRoute private_={true} />,
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
            }, {
                path: "categories",
                element: <CategoriesPage />
            }, {
                path: "analysis",
                element: <NivoPage />
            }]
        }, {
            path: "*",
            element: <NotFound/>
        }]
    }
]);