import mongoose from "mongoose";

const intentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    serialNo: {
        type: Number,
        required: [true, "Please enter a serial number"]
    },
    upiId: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: [true, "Please enter a price"]
    }
})

export default mongoose.model("intents", intentSchema)
