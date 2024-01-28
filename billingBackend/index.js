import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import errorHandler from "./middleware/ErrorHandlerMiddleware.js";
import limiter from "./middleware/RateLimitMiddleware.js";

import AuthRoute from "./routes/AuthRoute.js";
import FoodRoute from "./routes/FoodRoute.js";
import CategoryRoute from "./routes/CategoryRoute.js";
import UnitRoute from "./routes/UnitRoute.js";
import BillRoute from "./routes/BillRoute.js";

// create express app
const app = express();

// load env credential
dotenv.config();

// execute databse
connectDB();

// cors
app.use(cors());

// body parser
app.use(express.json());

// brute force limit
app.use(limiter);

app.get("",(req,res)=>{
res.send("server running")
})

// routes middleware
app.use("/auth", AuthRoute);
app.use("/food", FoodRoute);
app.use("/unit", UnitRoute);
app.use("/category", CategoryRoute);
app.use("/bill", BillRoute);

// error handler middleware
app.use(errorHandler);

// listener
app.listen(process.env.PORT || 9090, () => {
  console.log(`server running ✅
http://localhost:${process.env.PORT}`);
});
