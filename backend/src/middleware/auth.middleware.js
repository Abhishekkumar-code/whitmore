import jwt from "jsonwebtoken"
import { config } from "../config/config.js"
import usermodel from "../model/user.model.js"

export const authticateseller= async (req,res,next)=>{
  const token = req.cookies.token
  if(!token){
    return res.status(401).json({
        message:"Token not provided"
    })
  }
  try{
  
    const decoded = jwt.verify(token,config.JWT_SECRET)
    const user = await usermodel.findById(decoded.id)

    if(!user){
        return res.status(401).json({
            message:"Unauthorized "
        })
    }

    if(user.role!=="seller"){
        return res.status(403).json({
            message:"forbidden"
        })
    }

    req.user = user
    next()

  }catch(err){
        console.log(err)
        return res.status(401).json({
            message:"Unauthorized"
        })
  }
}
