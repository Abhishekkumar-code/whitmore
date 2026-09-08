import { Router } from "express";
import { authticateseller } from "../middleware/auth.middleware.js";
import { createproduct ,getallproducts,getsellerproducts } from "../controller/product.controller.js";
import { createProductValidator } from "../validator/product.validator.js";
import upload from "../middleware/upload.middleware.js";
const productrouter = Router();


productrouter.post("/",authticateseller,upload.array("images", 7),createProductValidator,createproduct
)
productrouter.get("/seller",authticateseller,getsellerproducts)



/**
*@route get /api/products
*@description Gel all products
*@acces Public
 */
productrouter.get("/allproducts",getallproducts)
export default productrouter;