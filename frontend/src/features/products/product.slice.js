import {createSlice} from "@reduxjs/toolkit";

const productSlice = createSlice({
    name:"product",
    initialState:{
        sellerProducts:[],
        allproducts:[]
        
    },reducers:{
        setSellerProducts:(state,action)=>{
            state.sellerProducts = action.payload
    },
      setallproducts:(state,action)=>{
        state.allproducts = action.payload
      }
    }
})

export const {setSellerProducts , setallproducts} = productSlice.actions
export default productSlice.reducer