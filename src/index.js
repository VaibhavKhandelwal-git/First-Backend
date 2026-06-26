import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/db.js";
import app from "./app.js"

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
})
.catch(
    (err)=>{
        console.error("Error occurred while starting the server:", err);
    }
)
