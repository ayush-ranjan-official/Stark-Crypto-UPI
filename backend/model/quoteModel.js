import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema({
    serialNo: {
        type: Number,
        required: [true, "Please enter a serial number"]
    },
    walletAddress: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: [true, "Please enter a price"]
    }
})

export default mongoose.model("quotes",quoteSchema)
