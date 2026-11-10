import dotenv from "dotenv"
dotenv.config()
export const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    IMAGEKIT_PRIVATE_KEY:process.env.IMAGEKIT_PRIVATE_KEY,
    RAZORPAY_API_KEY: process.env.RAZORPAY_API_KEY,
    RAZORPAY_SECRET:process.env.RAZORPAY_SECRET
}

if(!process.env.MONGO_URI){
    throw new Error("Mongo Uri is not defined")
}
if(!process.env.JWT_SECRET){
       throw new Error("Jwt secret is not found ")
}

if(!process.env.GOOGLE_CLIENT_ID){
    throw new Error("Google client id is not found ")

}

if(!process.env.GOOGLE_CLIENT_SECRET){
    throw new Error("Google client secret is not found ")
}
if(!process.env.IMAGEKIT_PRIVATE_KEY){
    throw new error("imagekit key not provided")
}
if(!process.env.RAZORPAY_SECRET){
    throw new error("rozarpay secret is not provided")
}
if(!process.env.RAZORPAY_API_KEY){
    throw new error("rozarpay api key is not provided")
}
