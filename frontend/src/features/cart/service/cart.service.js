import axios from "axios"

const cartapiinstance = axios.create({
    baseURL:"http://localhost:3000/api/cart",
    withCredentials:true
})
// /addtocart/:productId/:variantId


export const addItem = async ({ productId, varientId, quantity = 1 }) => {
  try {
    const response = await cartapiinstance.post(`/addtocart/${productId}/${varientId}`, {
      quantity: Number(quantity)
    });

    return response.data;
  } catch (error) {
    console.log("Status:", error.response?.status);
    console.log("Backend response:", error.response?.data);
    throw error;
  }
};