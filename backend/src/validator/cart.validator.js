import {param,body,validationResult} from "express-validator";


const validaterequest= (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            message: "Validation failed",
        })
    }
    next();
}

export const addtocartvalidator = [
    param("productId").isMongoId().withMessage("Invalid product ID"),
    param("variantId").isMongoId().withMessage("Invalid variant ID"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be a positive integer")
 ,validaterequest
]