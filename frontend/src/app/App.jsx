import "./App.css"
import { router } from "./app.routes"
import { RouterProvider } from "react-router-dom"
import { useAuth } from "../features/auth/hook/useAuth"
import { useSelector } from "react-redux"
import { useEffect } from "react"
function App() {

  const {handlegetme } = useAuth()
  const user = useSelector(state=>state.auth.user)
console.log(user);

  useEffect(()=>{
handlegetme()
  },[])
  return (



    <>
      <RouterProvider router={router} />
    </>
  )
}
export default App
