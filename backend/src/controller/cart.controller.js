import cartmodel from "../model/cart.model.js";
import productmodel from "../model/product.model.js";
import { stockofvarient } from "../dao/product.dao.js";

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
        let cart = await cartmodel.findOne({ user: user._id }).populate("items.product");

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