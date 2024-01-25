import express from "express";

// food controller
import {
  createFoodController,
  deleteFoodController,
  editFoodControlller,
  getFoodList,
} from "../controller/FoodController.js";

// middleware
import tokenCheck from "../middleware/tokenCheckMiddleware.js";
import logRequest from "../middleware/LoggerMiddleware.js";
import subscriptionPermission from "../middleware/subscriptionPermission.js";

// route
const FoodRoute = express.Router();

// http://localhost:8080/food/create
// {
// "foodName" : "chicken",
// "foodPrice" : 56,
// "foodUnit" : "6558af017599ae68a0720fd9",
// "foodCategory" : "65598b31d0b7ab294f45ecf7"
// }
FoodRoute.post(
  "/create",
  tokenCheck,
  subscriptionPermission,
  logRequest,
  createFoodController
);

// http://localhost:8080/food/edit
// {
//   "foodId":"65afcdaa0da147a2fa48a835",
//   "foodName":"Rice",
//   "foodPrice":"30",
//   "categoryId":"65af3c09997643fd4ea85ab9",
//   "unitId":"65b22cd4eec9327604a9778c"
// }
FoodRoute.post(
  "/edit",
  tokenCheck,
  subscriptionPermission,
  logRequest,
  editFoodControlller
);

// http://localhost:8080/food/delete/65599077f168f33948319d79
FoodRoute.delete(
  "/delete/:foodId",
  tokenCheck,
  logRequest,
  deleteFoodController
);

// http://localhost:8080/food/getallfood/
FoodRoute.get("/getallfood", tokenCheck, getFoodList);

export default FoodRoute;
