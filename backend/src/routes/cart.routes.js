import express from "express";
import {authicateuser} from "../middleware/auth.middleware.js";
import {addtocartvalidator} from "../validator/cart.validator.js";
import {addtocartcontroller} from "../controller/cart.controller.js";
import { getcartcontroller } from "../controller/cart.controller.js"
const cartrouter = express.Router();


/**
 *  @route POST /api/cart/addtocart
 *   @desc Add a product to the user's cart 
 *   @access Private
 *   @argument: { productId, variantId, quantity , price }
 */
cartrouter.post("/addtocart/:productId/:variantId",authicateuser, addtocartvalidator,addtocartcontroller)

/**
 * @route GET /api/cart/getcart
 *  @desc Get the user's cart 
 * @access Private
 *  
*/
cartrouter.get("/getcart",authicateuser, getcartcontroller);
export default cartrouter;
