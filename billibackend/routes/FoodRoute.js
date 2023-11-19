import express from "express";

// food controller
import {
  createFoodController,
  deleteFoodController,
} from "../controller/FoodController.js";

// middleware
import CheckLogin from "../middleware/CheckLoginMiddleware.js";
import logRequest from "../middleware/LoggerMiddleware.js";

// route
const FoodRoute = express.Router();

// http://localhost:8080/food/create
// {
// "foodName" : "chicken",
// "foodPrice" : 56,
// "foodUnit" : "6558af017599ae68a0720fd9",
// "foodCategory" : "65598b31d0b7ab294f45ecf7"
// }
FoodRoute.post("/create", CheckLogin, logRequest, createFoodController);

// http://localhost:8080/food/delete/65599077f168f33948319d79
FoodRoute.delete(
  "/delete/:foodId",
  CheckLogin,
  logRequest,
  deleteFoodController
);

export default FoodRoute;
