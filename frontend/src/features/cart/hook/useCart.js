import { addItem, getCart, Incrementcartitem } from "../service/cart.service.js";
import { useDispatch } from "react-redux";
import { addItem as additemtocart, setItems, updateQuantity, incrementQuantity, removeItem, clearCart } from "../cart.slice";

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleadditem({ productId, varientId, quantity = 1 }) {
        try {
            const data = await addItem({ productId, varientId, quantity });
            if (data?.success) {
                dispatch(additemtocart(data.cart || { productId, varientId, quantity }));
            }
            return data;
        } catch (error) {
            console.error("Add item error:", error);
        }
    }

    async function handlegetcart() {
        try {
            const data = await getCart();
            const cart = data?.cart?.[0] || null;
            dispatch(setItems({ items: cart?.items, totalprice: cart?.totalprice, currency: cart?.currency }));
            return cart?.items || [];
        } catch (error) {
            console.warn("Get cart error:", error);
        }
    }

    async function handleincrementquantity({ productId, varientId }) {
        try {
            const data = await Incrementcartitem({ productId, varientId });
            if (data?.success) {
                dispatch(incrementQuantity({ productId, varientId }));
            }
            return data;
        } catch (error) {
            console.error("Increment item error:", error);
            throw error;
        }
    }

    function handleupdatequantity(itemId, quantity) {
        dispatch(updateQuantity({ itemId, quantity }));
    }

    function handleremoveitem(itemId) {
        dispatch(removeItem(itemId));
    }

    function handleclearcart() {
        dispatch(clearCart());
    }

    return { 
        handleadditem, 
        handlegetcart, 
        handleincrementquantity,
        handleupdatequantity, 
        handleremoveitem,
        handleclearcart 
    };
};