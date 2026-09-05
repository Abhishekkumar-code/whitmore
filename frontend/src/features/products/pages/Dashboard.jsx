import React, { useEffect } from "react";
import useproduct from "../hooks/useproduct";
import { useSelector } from "react-redux";

const Dashboard = () => {

  const { handlegetsellerproduct } = useproduct()

  const sellerproducts = useSelector(state => state.product.sellerproducts)
  useEffect(() => {
    handlegetsellerproduct()
  }, [])
  console.log(sellerproducts);

  return (

    <div className="white">Dashboard</div>
  )
}

export default Dashboard;