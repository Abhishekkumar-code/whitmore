import { addItem, getCart } from "../service/cart.service.js";
import { useDispatch } from "react-redux";
import { addItem as additemtocart, setItems, updateQuantity, removeItem, clearCart } from "../cart.slice";

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
            const items = data?.cart?.items || data?.items || [];
            dispatch(setItems(items));
            return items;
        } catch (error) {
            console.warn("Get cart warning/error:", error);
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
        handleupdatequantity, 
        handleremoveitem,
        handleclearcart 
    };
};