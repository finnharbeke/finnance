import { createBrowserRouter } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { SignUpForm } from "../components/auth/SignUpForm";
import CategoriesPage from "../components/category/CategoriesPage";
import NivoPage from "../nivo/NivoPage";
import NotFound from "../pages/404";
import AccountPage from "../pages/Account";
import AccountsPage from "../pages/Accounts";
import DashboardPage from "../pages/Dashboard";
import Layout from "../pages/Layout";
import LogoutPage from "../pages/Logout";
import { RemotesPage } from "../pages/Remotes";
import { AuthRoute } from "./Route";
import { TransactionsPage } from "../pages/Transactions";

export const FinnanceRouter = createBrowserRouter([
    {
        element: <Layout />,
        children: [{
            element: <AuthRoute private_={false} />,
            children: [{
                path: "login",
                element: <LoginForm />
            }, {
                path: "register",
                element: <SignUpForm />
            }]
        }, {
            element: <AuthRoute private_={true} />,
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
            }, {
                path: "remotes",
                element: <RemotesPage />
            }, {
                path: "transactions",
                element: <TransactionsPage />
            }]
        }, {
            path: "*",
            element: <NotFound/>
        }]
    }
]);