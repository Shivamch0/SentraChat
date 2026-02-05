import app from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

dotenv.config({
    path : ".env"
})

const Port = process.env.PORT || 3000;

connectDB()
.then(() => {
    app.listen(Port , ( req , res ) => {
    console.log("Server is listening on port : " , Port)
    }
)
})
.catch((error) => {
    console.log(error)
})