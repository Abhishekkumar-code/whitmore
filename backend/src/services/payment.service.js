import Razorpay from "razorpay";
import { config } from "../config/config.js";

const razorpay = new Razorpay({
key_id:config.RAZORPAY_API_KEY,
key_secret:config.RAZORPAY_SECRET
})

export const creatorder = async({amount,currency="INR"})=>{
    const options ={
         amount:amount * 100,
         currency
    }

    const order = await razorpay.orders.create(options)

    return order
}