import { createBrowserRouter, Navigate } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/products/pages/CreateProducts.jsx";
import Dashboard from "../features/products/pages/Dashboard.jsx"
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
        path: "/seller",
        children: [{
            path: "createproduct",
            element: <CreateProduct />

        }, {
            path: "dashboard",
            element: <Dashboard/>

        }
        ]
    }
])