import { createBrowserRouter, Navigate } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProducts from "../features/products/pages/CreateProducts";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <h1>Hello world</h1>
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/seller/createproduct",
        element: <CreateProducts />
    }
])