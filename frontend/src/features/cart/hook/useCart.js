import { addItem } from "../service/cart.service.js";
import { useDispatch } from "react-redux";
import { addItem as additemtocart } from "../cart.slice";

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleadditem({ productId, varientId, quantity = 1 }) {
        const data = await addItem({ productId, varientId, quantity });
        if (data?.success) {
            dispatch(additemtocart(data.cart || { productId, varientId, quantity }));
        }
        return data;
    }

    return { handleadditem };
};