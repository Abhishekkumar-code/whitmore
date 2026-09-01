import { Router } from "express";
import { authticateseller } from "../middleware/auth.middleware.js";
import { createproduct } from "../controller/product.controller.js";
import upload from "../middleware/upload.middleware.js";
const productrouter = Router();


productrouter.post("/product",authticateseller,upload.array("images",4),createproduct)


export default productrouter;