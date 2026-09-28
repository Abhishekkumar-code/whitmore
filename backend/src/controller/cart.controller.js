import cartmodel from "../model/cart.model.js";
import productmodel from "../model/product.model.js";
export async function addtocartcontroller(req,res){
    const {productId,variantId}= req.params;

    const product = await productmodel.findOne({
        _id: productId,
        "variants._id": variantId
    });

    if(!product){
        return res.status(404).json({
            message: "Product and Varients not found",
            success: false
        })

     const cart = (await cartmodel.findOne({user:req.user._id})) || 
     (await cartmodel.create({user:req.user._id }))

    const isProductalreadyinCart  = cart.items.some(item => item.product.toString() === productId && item.varient.toString() === variantId)
    if(isProductalreadyinCart){
        
    }
    }
}