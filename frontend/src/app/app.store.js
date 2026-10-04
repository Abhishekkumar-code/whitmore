import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth.slice";
import productReducer from "../features/products/product.slice";
import cartReducer from "../features/cart/cart.slice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart:cartReducer
  },
});
