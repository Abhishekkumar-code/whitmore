import { createBrowserRouter, Navigate } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/products/pages/CreateProducts.jsx";
import Dashboard from "../features/products/pages/Dashboard.jsx"
import Protected from "../features/auth/components/Protected.jsx"
import PublicOnly from "../features/auth/components/PublicOnly.jsx"
import Home from "../features/products/pages/Home.jsx"
export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home/>
    },
    {
        path: "/register",
        element: <PublicOnly><Register /></PublicOnly>
    },
    {
        path: "/login",
        element: <PublicOnly><Login /></PublicOnly>
    },
    {
        path: "/seller",
        children: [{
            path: "createproduct",
            element:<Protected role="seller">  <CreateProduct /></Protected>

        }, {
            path: "dashboard",
            element: <Protected role="seller"><Dashboard/></Protected> 

        }
        ]
    }
])