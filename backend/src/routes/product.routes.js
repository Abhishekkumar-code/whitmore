import { Router } from "express";
import { authticateseller } from "../middleware/auth.middleware.js";
import { createproduct, getallproducts, getsellerproducts, getProductDetails, addvarientsofproduct } from "../controller/product.controller.js";
import { createProductValidator } from "../validator/product.validator.js";
import upload from "../middleware/upload.middleware.js";

const productrouter = Router();


productrouter.post("/", authticateseller, upload.array("images", 7), createProductValidator, createproduct
)
productrouter.get("/seller", authticateseller, getsellerproducts)



/**
*@route get /api/products
*@description Gel all products
*@acces Public
 */
productrouter.get("/allproducts", getallproducts)

/**
 *  @route GET api/product/getproduct/:id
 * @description Get prodyct details by iD 
 * @access Public
 */

productrouter.get("/getproduct/:id", getProductDetails)


/*
* @route post /api/product
* description Add a new variants to a product 
* access private (seller only)

*/
productrouter.post("/:productId/varients", authticateseller, upload.array('images', 4), addvarientsofproduct);
export default productrouter;