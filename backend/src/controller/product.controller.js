import productmodel from "../model/product.model.js";
import { uploadfile } from "../services/storage.service.js";



export async function createproduct(req,res){

const {title,description,priceamount,pricecurrency} = req.body;
const seller = req.user;
console.log(req.files)

const images = await Promise.all(req.files.map(async(file)=>{
    return await uploadfile({
        buffer:file.buffer,
        fileName:file.originalname
    })
}))

const product = await productmodel.create({
    title,
    description,
    price:{
        amount:priceamount,
        currency:pricecurrency||"INR"
    },
    images,
    seller:seller._id
})

res.status(201).json({
    message:"product created succesfully",
    success:true,
    product
})

}

export async function getsellerproducts(req,res){

    const seller = req.user;

    const product = await productmodel.find({seller:seller._id});
  return res.status(200).json({
    message:"product created succesfully ",
    success:"false",
    product
  })
}