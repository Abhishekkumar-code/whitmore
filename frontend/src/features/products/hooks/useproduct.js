import { useState } from "react";
import { useDispatch } from "react-redux";
import { createproduct as createproductApi } from "../services/product.api";
import { setSellerProducts } from "../product.slice";

export const useproduct = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);
    const [success, setSuccess] = useState(false);

    const handlecreateproduct = async (formData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const data = await createproductApi(formData);

            // optimistically push new product into sellerProducts
            dispatch(setSellerProducts([])); // will be refetched on list page

            setSuccess(true);
            return { success: true, data };
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create product. Please try again.";
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };
    
    return {
        loading,
        error,
        success,
        handlecreateproduct,
        clearError: () => setError(null),
    };
};

export default useproduct;
