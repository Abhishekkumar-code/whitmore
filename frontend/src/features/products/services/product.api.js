import axios from "axios"

const productapiinstance = axios.create({
    baseURL:"http://localhost:3000/api/product",
    withCredentials:true
})

export async function createproduct(formData){
    const response = await productapiinstance.post("/",formData)

    return response.data
}

export async function getseller(){
    const response = await productapiinstance.get("/seller")

    return response.data
}