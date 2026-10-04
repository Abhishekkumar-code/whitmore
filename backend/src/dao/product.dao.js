import productmodel from "../model/product.model.js";

export const stockofvarient = async (productid, variantid) => {
    const product = await productmodel.findOne({
        _id: productid,
        "variants._id": variantid
    });
    if (!product || !product.variants) return 0;
    const variant = product.variants.find(v => v._id?.toString() === variantid);
    return variant ? Number(variant.stock || 0) : 0;
}