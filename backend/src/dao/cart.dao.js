import mongoose from "mongoose"
import cartmodel from "../model/cart.model.js"


export async function getcartdetails(userId){
 
     let cart = await cartmodel.aggregate(
            [
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(userId)
      }
                },
                { $unwind: { path: '$items' } },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.product',
                        foreignField: '_id',
                        as: 'items.product'
                    }
                },
                { $unwind: { path: '$items.product' } },
                {
                    $unwind: { path: '$items.product.variants' }
                },
                {
                    $match: {
                        $expr: {
                            $eq: [
                                '$items.varient',
                                '$items.product.variants._id'
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        ItemPrice: {
                            Price: {
                                $multiply: [
                                    '$items.quantity',
                                    '$items.product.price.amount'
                                ]
                            },
                            currency:
                                '$items.product.variants.price.currency'
                        }
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        totalprice: { $sum: '$ItemPrice.Price' },
                        currency: {
                            $first: '$ItemPrice.currency'
                        },
                        items: { $push: '$items' }
                    }
                }
            ],
        );

        return cart;
}