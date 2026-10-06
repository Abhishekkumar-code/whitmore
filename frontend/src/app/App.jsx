import "./App.css";
import { router } from "./app.routes";
import { RouterProvider } from "react-router-dom";
import { useAuth } from "../features/auth/hook/useAuth";

import { useEffect } from "react";

function App() {
  const { handlegetme } = useAuth();

  useEffect(() => {
    handlegetme();
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
