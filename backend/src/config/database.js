import mongoose from "mongoose";
import { config } from "./config.js";
const connectodb = async () => {

    try {
        await mongoose.connect(config.MONGO_URI);

        console.log("Mongo DB Connected Successfully");
    }
    catch (error) {
        console.log("Not connected")
    }

};

export default connectodb;