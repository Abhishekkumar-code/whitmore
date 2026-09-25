import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    price:{
        amount:{
            type:Number,
            required:true
        },
            currency:{
                type:String,
                enum:["USD","EUR","GBP","JPY","INR"],
                default:"INR"
            }
        
    },
    images:[
        {
            url:{
                type:String,
                required:true
            }
        }
    ],

    variants:[
        {
           images:[{
            url:{
                type:String,
                required:true
            }
           }],
           
           stock:{
            type:Number,
            required:true,
            default:0
           },
           attributes:{
            type:Map,
            of:String

           },
           price:{
            amount:{
                type:Number,
                required:true
            }
           }

        }
    ]

},{timestamps:true})

const productmodel = mongoose.model("product",productSchema)
export default productmodel