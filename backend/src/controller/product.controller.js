import productmodel from "../model/product.model.js";
import { uploadfile } from "../services/storage.service.js";

export async function createproduct(req, res) {

    const { title, description, priceamount, pricecurrency } = req.body;
    const seller = req.user;
    console.log(req.files)

    const images = await Promise.all(req.files.map(async (file) => {
        return await uploadfile({
            buffer: file.buffer,
            fileName: file.originalname
        })
    }))

    const product = await productmodel.create({
        title,
        description,
        price: {
            amount: priceamount,
            currency: pricecurrency || "INR"
        },
        images,
        seller: seller._id
    })

    res.status(201).json({
        message: "product created succesfully",
        success: true,
        product
    })

}

export async function getsellerproducts(req, res) {

    const seller = req.user;

    const product = await productmodel.find({ seller: seller._id });
    return res.status(200).json({
        message: "product fetched succesfully ",
        success: "true",
        product
    })
}


export async function getallproducts(req, res) {
    const allproducts = await productmodel.find()

    return res.status(200).json({
        message: "Products fetched Succefully",
        success: true,
        allproducts
    })
}

export async function getProductDetails(req, res) {
    const { id } = req.params;

    const product = await productmodel.findById(id)
    if (!product) {
        return res.status(404).json({
            message: "Products not found",
            success: false
        })
    }
    return res.status(200).json({
        message: "product details fetched succesfully", success: true, product

    })
}

export async function addvarientsofproduct(req, res) {

    const productId = req.params.productId;

    const product = await productmodel.findOne({
        _id: productId,
        seller: req.user._id
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    const files = req.files;
    const images = [];
    if (files || files.length !== 0) {
        (await Promise.all(files.map(async (file) => {
            const image = await uploadfile({
                buffer: file.buffer,
                fileName: file.originalname
            })
            return image
        }))).map(image => images.push(image))
    }

    const price = req.body.priceAmount || req.body.priceamount;
    const stock = req.body.stock;
    const attributes = JSON.parse(req.body.attributes || "{}");

    console.log(price);

    product.variants.push({
        images,
        price: {
            amount: Number(price) || product.price.amount,
            currency: req.body.priceCurrency || req.body.pricecurrency || product.price.currency
        },
        stock,
        attributes
    });

    await product.save();

    return res.status(200).json({
        message: "Product variant added successfully",
        success: true,
        product
    })

}