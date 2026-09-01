import productmodel from "../model/product.model.js";
import { uploadfile } from "../services/storage.service.js";
export async function createproduct(req,res){

const {title,description,price} = req.body;
const seller = req.user;
console.log(req.file)

}