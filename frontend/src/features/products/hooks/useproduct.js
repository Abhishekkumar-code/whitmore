import { useState } from "react";
import { useDispatch } from "react-redux";
import { createproduct as createproductApi, getseller as sellerproductApi, getallproducts as getallproductsApi } from "../services/product.api";
import { setSellerProducts, setallproducts } from "../product.slice";

export const useproduct = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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

    const handlegetsellerproducts = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            const data = await sellerproductApi()
            dispatch(setSellerProducts(data.product));
            return data.product
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to seen the Products.";
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }

    }

    const handleallproducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getallproductsApi();
            const productsList = data.allproducts || [];
            dispatch(setallproducts(productsList));
            return productsList;
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to fetch products. Please try again.";
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
    handlegetsellerproducts,
    handleallproducts,
    clearError: () => setError(null),
};
};

export default useproduct;