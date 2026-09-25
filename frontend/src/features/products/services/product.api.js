import axios from "axios"

const productapiinstance = axios.create({
    baseURL: "http://localhost:3000/api/product",
    withCredentials: true
})

export async function createproduct(formData) {
    const response = await productapiinstance.post("/", formData)

    return response.data
}

export async function getseller() {
    const response = await productapiinstance.get("/seller")

    return response.data
}

export async function getallproducts() {

    const response = await productapiinstance.get("/allproducts")
    return response.data
}


export async function getproductdetail(productId) {
    const response = await productapiinstance.get(`/getproduct/${productId}`)
    return response.data
}

export async function addProductVarient(productId, newProductVariant) {
    let formData;
    if (newProductVariant instanceof FormData) {
        formData = newProductVariant;
    } else {
        formData = new FormData();
        if (newProductVariant?.images && Array.isArray(newProductVariant.images)) {
            newProductVariant.images.forEach((image) => {
                const fileToAppend = image?.file || image;
                if (fileToAppend) {
                    formData.append("images", fileToAppend);
                }
            });
        }
        if (newProductVariant?.stock !== undefined) {
            formData.append("stock", newProductVariant.stock);
        }
        const price = newProductVariant?.price?.amount ?? newProductVariant?.priceAmount;
        if (price !== undefined) {
            formData.append("priceAmount", price);
            formData.append("priceamount", price);
        }
        if (newProductVariant?.attributes) {
            const attrs = typeof newProductVariant.attributes === "string"
                ? newProductVariant.attributes
                : JSON.stringify(newProductVariant.attributes);
            formData.append("attributes", attrs);
        }
    }

    const response = await productapiinstance.post(`/${productId}/varients`, formData);
    return response.data;
}