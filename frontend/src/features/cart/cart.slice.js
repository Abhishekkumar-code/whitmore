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
        removeItem: (state, action) => {
            state.items = state.items.filter((i) => i._id !== action.payload);
        },
        clearCart: (state) => {
            state.items = [];
        }
    }
});

export const { setItems, addItem, updateQuantity, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;