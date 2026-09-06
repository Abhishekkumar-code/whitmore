import React, { useEffect } from "react";
import useproduct from "../hooks/useproduct";
import { useSelector } from "react-redux";

const Dashboard = () => {

  const { handlegetsellerproducts} = useproduct()

  const sellerproducts = useSelector(state => state.product.sellerProducts)
  useEffect(() => {
  handlegetsellerproducts()
  }, [])

  console.log(sellerproducts);

  return (

    <div className="white">Dashboard</div>
  )
}

export default Dashboard;