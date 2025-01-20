import express from "express"
import { create, deleteQuote, fetch, update } from "../controller/quoteController.js";

const route = express.Router();

route.get("/getallquotes/:serialNo", fetch)
//route.get("/getquote", getOne)
route.post ("/create",create)
route.put("/update/:id", update)
route.delete("/delete/:id",deleteQuote)

export default route;