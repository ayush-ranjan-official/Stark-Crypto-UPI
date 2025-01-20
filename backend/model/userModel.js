import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
})

export default mongoose.model("users",userSchema)

/*
The versionKey is a property set on each document when first created by Mongoose. 
This keys value contains the internal revision of the document. 
The name of this document property is configurable. The default is __v = 0.

If this conflicts with your application you can configure as such:

new Schema({..}, { versionKey: '_somethingElse' }) or versionKey: false 
*/ 