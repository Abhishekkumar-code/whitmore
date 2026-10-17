import cartmodel from "../model/cart.model.js";
import productmodel from "../model/product.model.js";
import { stockofvarient } from "../dao/product.dao.js";
import  mongoose from "mongoose"
export async function addtocartcontroller(req, res) {
    try {
        const { productId, variantId } = req.params;
        const requestedQuantity = Number(req.body?.quantity || 1);

        const product = await productmodel.findOne({
            _id: productId,
            "variants._id": variantId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product and Variant not found",
                success: false
            });
        }

        const stock = Number(await stockofvarient(productId, variantId));

        let cart = await cartmodel.findOne({ user: req.user._id });
        if (!cart) {
            cart = await cartmodel.create({ user: req.user._id, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(
            item => item.product?.toString() === productId && item.varient?.toString() === variantId
        );

        if (existingItemIndex > -1) {
            const currentQtyInCart = Number(cart.items[existingItemIndex].quantity || 0);
            if (currentQtyInCart + requestedQuantity > stock) {
                return res.status(400).json({
                    message: `Insufficient stock. You already have ${currentQtyInCart} in cart, and only ${stock} available in stock.`,
                    success: false
                });
            }

            cart.items[existingItemIndex].quantity = currentQtyInCart + requestedQuantity;
            await cart.save();

            const updatedCart = await cartmodel.findOne({ user: req.user._id }).populate("items.product");

            return res.status(200).json({
                message: "Product quantity updated in cart",
                success: true,
                cart: updatedCart
            });
        }

        if (requestedQuantity > stock) {
            return res.status(400).json({
                message: `Only ${stock} items are available in stock`,
                success: false
            });
        }

        const matchedVariant = product.variants?.find(v => v._id?.toString() === variantId);
        const itemPrice = matchedVariant?.price?.amount !== undefined ? matchedVariant.price : product.price;

        cart.items.push({
            product: productId,
            varient: variantId,
            quantity: requestedQuantity,
            price: itemPrice
        });

        await cart.save();
        const updatedCart = await cartmodel.findOne({ user: req.user._id }).populate("items.product");

        return res.status(200).json({
            message: "Product added to cart successfully",
            success: true,
            cart: updatedCart
        });
    } catch (error) {
        console.error("Add to cart error:", error);
        return res.status(500).json({
            message: error.message || "Internal server error while adding to cart",
            success: false
        });
    }
}

export async function getcartcontroller(req, res) {
    try {
        const user = req.user;
        // let cart = await cartmodel.findOne({ user: user._id }).populate("items.product");
        let cart = await cartmodel.aggregate(
            [
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(user._id)
      }
                },
                { $unwind: { path: '$items' } },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.product',
                        foreignField: '_id',
                        as: 'items.product'
                    }
                },
                { $unwind: { path: '$items.product' } },
                {
                    $unwind: { path: '$items.product.variants' }
                },
                {
                    $match: {
                        $expr: {
                            $eq: [
                                '$items.varient',
                                '$items.product.variants._id'
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        ItemPrice: {
                            Price: {
                                $multiply: [
                                    '$items.quantity',
                                    '$items.product.price.amount'
                                ]
                            },
                            currency:
                                '$items.product.variants.price.currency'
                        }
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        totalprice: { $sum: '$ItemPrice.Price' },
                        currency: {
                            $first: '$ItemPrice.currency'
                        },
                        items: { $push: '$items' }
                    }
                }
            ],
        );
        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false
            });
        }
        return res.status(200).json({
            message: "Cart found",
            success: true,
            cart
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal server error",
            success: false
        });
    }
}



export const incrementCartItemQuantity = async (req, res) => {
    try {
        const { productId, variantId } = req.params;

        const product = await productmodel.findOne({
            _id: productId,
            "variants._id": variantId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product or variant not found",
                success: false
            });
        }

        const cart = await cartmodel.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false
            });
        }

        const stock = Number(await stockofvarient(productId, variantId));

        const itemInCart = cart.items.find(
            item => item.product?.toString() === productId && item.varient?.toString() === variantId
        );

        if (!itemInCart) {
            return res.status(404).json({
                message: "Item not found in cart",
                success: false
            });
        }

        const itemQuantityInCart = Number(itemInCart.quantity || 0);

        if (itemQuantityInCart + 1 > stock) {
            return res.status(400).json({
                message: `Only ${stock} items left in stock, and you already have ${itemQuantityInCart} items in your cart`,
                success: false
            });
        }

        itemInCart.quantity = itemQuantityInCart + 1;
        await cart.save();

        const updatedCart = await cartmodel.findOne({ user: req.user._id }).populate("items.product");

        return res.status(200).json({
            message: "Cart item quantity incremented successfully",
            success: true,
            cart: updatedCart
        });
    } catch (error) {
        console.error("Increment cart item quantity error:", error);
        return res.status(500).json({
            message: error.message || "Internal server error while incrementing quantity",
            success: false
        });
    }
};