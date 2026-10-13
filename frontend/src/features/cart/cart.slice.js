import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
    },
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload || [];
        },
        addItem: (state, action) => {
            state.items.push(action.payload);
        },
        updateQuantity: (state, action) => {
            const { itemId, quantity } = action.payload;
            const item = state.items.find((i) => i._id === itemId);
            if (item) {
                item.quantity = Math.max(1, quantity);
            }
        },
        incrementQuantity: (state, action) => {
            const { productId, varientId } = action.payload;
            const item = state.items.find((i) => {
                const itemProductId = i.product?._id || i.product;
                const itemVarientId = i.varient || i.variant;
                return (
                    (itemProductId === productId || i._id === productId) &&
                    (!varientId || itemVarientId === varientId)
                );
            });
            if (item) {
                item.quantity = (item.quantity || 1) + 1;
            }
        },
        removeItem: (state, action) => {
            state.items = state.items.filter((i) => i._id !== action.payload);
        },
        clearCart: (state) => {
            state.items = [];
        }
    }
});

export const { setItems, addItem, updateQuantity, incrementQuantity, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;