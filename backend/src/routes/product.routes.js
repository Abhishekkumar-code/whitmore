import { Router } from "express";
import { authticateseller } from "../middleware/auth.middleware.js";
import { createproduct ,getsellerproducts } from "../controller/product.controller.js";
import { createProductValidator } from "../validator/product.validator.js";
import upload from "../middleware/upload.middleware.js";
const productrouter = Router();


productrouter.post("/",authticateseller,createProductValidator,upload.array("images",4),createproduct)

productrouter.get("/seller",authticateseller,getsellerproducts)
export default productrouter;