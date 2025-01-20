import express from "express"
import { create, deleteIntent, fetch, getOne, update } from "../controller/intentController.js";

const route = express.Router();

route.get("/getallintents", fetch)
route.get("/getintent/:serialNo", getOne)
route.post ("/create",create)
route.put("/update/:id", update)
route.delete("/delete/:id",deleteIntent)

export default route;