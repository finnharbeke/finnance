import {
    createRoutesFromElements, Outlet, Route
} from "react-router";
import { createBrowserRouter } from "react-router-dom";
import LoaderError from "../components/LoaderError";
import { LoginForm } from "../components/LoginForm";
import NotFound from "../pages/404";
import AccountPage, { loader as accountLoader } from "../pages/Account";
import AdminPage from "../pages/Admin";
import DashboardPage, { loader as dashboardLoader } from "../pages/Dashboard";
import Layout from "../pages/Layout";
import LogoutPage from "../pages/Logout";
import { PrivateRoute, StrictPublicRoute } from "./Route";

const routes = (

    <Route element={<Layout />} errorElement={<LoaderError/>}>
        <Route element={<Outlet/>}>
            {/* <Route index element={<HomePage />}></Route> */}
            <Route element={<StrictPublicRoute />}>
                <Route path="login" element={<LoginForm />} />
            </Route>
            <Route element={<PrivateRoute />}>
                <Route index element={<DashboardPage />} loader={dashboardLoader} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="logout" element={<LogoutPage />} />
                <Route path="accounts/:id" element={<AccountPage />} loader={accountLoader} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Route>
    </Route>

);

export const FinnanceRouter = createBrowserRouter(
    createRoutesFromElements(routes)
);