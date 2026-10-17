import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        totalprice: 0,
        currency: null,
    },
    reducers: {
        setItems: (state, action) => {
            const payload = action.payload;
            if (Array.isArray(payload)) {
                // If payload is [ { items: [...], totalprice, currency } ] (MongoDB aggregation pipeline output)
                if (payload.length > 0 && Array.isArray(payload[0]?.items)) {
                    state.items = payload[0].items;
                    state.totalprice = payload[0].totalprice || 0;
                    state.currency = payload[0].currency || "INR";
                } else {
                    state.items = payload;
                }
            } else if (payload && typeof payload === "object") {
                // If payload is { items: [...], totalprice, currency }
                state.items = Array.isArray(payload.items) ? payload.items : [];
                if (payload.totalprice !== undefined) state.totalprice = payload.totalprice;
                if (payload.currency) state.currency = payload.currency;
            } else {
                state.items = [];
            }
        },
        addItem: (state, action) => {
            state.items.push(action.payload);
        },
        updateQuantity: (state, action) => {
            const { itemId, quantity } = action.payload;
            const item = state.items.find((i) => String(i._id) === String(itemId));
            if (item) {
                item.quantity = Math.max(1, Number(quantity) || 1);
            }
        },
        incrementQuantity: (state, action) => {
            const { productId, varientId } = action.payload;
            const item = state.items.find((i) => {
                const itemProductId = i.product?._id || i.product;
                const itemVarientId =
                    (typeof i.varient === "object" && i.varient !== null ? i.varient._id : i.varient) ||
                    (typeof i.variant === "object" && i.variant !== null ? i.variant._id : i.variant) ||
                    (i.product?.variants?._id);
                return (
                    (String(itemProductId) === String(productId) || String(i._id) === String(productId)) &&
                    (!varientId || String(itemVarientId) === String(varientId))
                );
            });
            if (item) {
                item.quantity = (Number(item.quantity) || 1) + 1;
            }
        },
        removeItem: (state, action) => {
            state.items = state.items.filter((i) => String(i._id) !== String(action.payload));
        },
        clearCart: (state) => {
            state.items = [];
            state.totalprice = 0;
        }
    }
});

export const { setItems, addItem, updateQuantity, incrementQuantity, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;