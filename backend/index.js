import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import userRoute from "./routes/userRoute.js"
import intentRoute from "./routes/intentRoute.js"
import quoteRoute from "./routes/quoteRoute.js"
import cors from "cors";

const app = express ();
app.use(bodyParser.json());
app.use(cors());


dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGOURL = process.env.MONGO_URL; 

mongoose.connect(MONGOURL).then(()=>{
    console.log("Database connected Successfully.")
    app.listen(PORT, ()=>{
        console.log(`Server is running on port : ${PORT}`)
    })
}).catch(error => console.log(error));

app.use("/api/user", userRoute);
app.use("/api/intent", intentRoute);
app.use("/api/quote", quoteRoute);