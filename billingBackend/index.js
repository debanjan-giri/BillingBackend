import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// database
import connectDB from "./config/db.js";

// middleware
import errorHandler from "./middleware/ErrorHandlerMiddleware.js";
import limiter from "./middleware/RateLimitMiddleware.js";

// routes
import AuthRoute from "./routes/AuthRoute.js";
import FoodRoute from "./routes/FoodRoute.js";
import CategoryRoute from "./routes/CategoryRoute.js";
import UnitRoute from "./routes/UnitRoute.js";
import BillRoute from "./routes/BillRoute.js";

// create express app
const app = express();

// load credential
dotenv.config();

// execute databse
connectDB();

// cors
app.use(cors());

// parser middlware
app.use(express.json());

// brute force limit
app.use(limiter);

// routes middleware
app.use("/auth/", AuthRoute);
app.use("/food", FoodRoute);
app.use("/unit", UnitRoute);
app.use("/category", CategoryRoute);
app.use("/bill", BillRoute);

// central error handler middleware
app.use(errorHandler);

// server listener
app.listen(process.env.PORT || 9090, () => {
  console.log(`server running ✅
http://localhost:${process.env.PORT}`);
});
