import express from "express";

// middleware
import CheckLogin from "../middleware/CheckLoginMiddleware.js";
import logRequest from "../middleware/LoggerMiddleware.js";

// controller
import {
  createCategoryController,
  deleteCategoryController,
  getCategoryDetailsController,
  getByIdCategoryController,
  getCategoryIdListController,
} from "../controller/CategoryController.js";

// route
const CategoryRoute = express.Router();

// http://localhost:8080/category/create
// {
// "categoryName" : "Dinner"
// }
CategoryRoute.post("/create", CheckLogin, logRequest, createCategoryController);

// http://localhost:8080/category/delete/6559887362171e8b05652958
CategoryRoute.delete(
  "/delete/:categoryId",
  CheckLogin,
  logRequest,
  deleteCategoryController
);

// http://localhost:8080/category/id/65598b31d0b7ab294f45ecf7
CategoryRoute.get(
  "/id/:categoryId",
  CheckLogin,
  logRequest,
  getByIdCategoryController
);

// http://localhost:8080/category/idList
CategoryRoute.get(
  "/idList",
  CheckLogin,
  logRequest,
  getCategoryIdListController
);

// http://localhost:8080/category/idListDetails
// {
// "categoryName" : "snack"
// }
CategoryRoute.get(
  "/idListDetails",
  CheckLogin,
  logRequest,
  getCategoryDetailsController
);

export default CategoryRoute;
