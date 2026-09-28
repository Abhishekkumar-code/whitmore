import mongoose from "mongoose";
import priceSchema from "./price.schema.js";
const CartSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
     },
        items:[{
          product:{
            type:mongoose.Schema.Types.ObjectId,
             ref:"product",
             required:true
            },
        varient:{
             type:mongoose.Schema.Types.ObjectId,
            ref:"product.variants"
        },
        quantity:{
            type:Number,
            default:1
        },
        price:{
           type:priceSchema,
           required:true
            
        }
    
     }] 
  

})

const cartmodel = mongoose.model("cart",CartSchema);

export default cartmodel;