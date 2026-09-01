import {body, validationResult} from "express-validator"



function validateRequest(req,res,next){
    const error = validationResult(req);
if(!error.isEmpty()){
    return res.status(400).json({error:error.array()})
}

next()
}

export const registerValidator = [
    body("email").isEmail().withMessage("Invalid emial format"),
    body("contact").notEmpty().withMessage("Contact is required")
    .matches(/^\d{10}$/).withMessage("Contact must be 10-digit number"),
    body("password").isLength({min:6}).withMessage("Password must be 6 character long"),
    body("fullname").notEmpty().withMessage("Full Name is Required").isLength({min:3}).withMessage("Full name must be 3 charater long"),
    body("isSeller").isBoolean().withMessage("isSeller must be a boolean value"),
    validateRequest
]

export const loginValidator=[
body("email").isEmail().withMessage("Invalid Email Format"),
body("password").notEmpty().isLength({min:6}).withMessage("Password must be 6 charcter long"),
validateRequest
]