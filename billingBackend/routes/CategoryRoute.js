import express from "express";

// middleware
import tokenCheck from "../middleware/tokenCheckMiddleware.js";
import logRequest from "../middleware/LoggerMiddleware.js";

// controller
import {
  createCategoryController,
  deleteCategoryController,
  getCategoryDetailsController,
  getByIdCategoryController,
  getCategoryIdListController,
  getAllCategoryList,
} from "../controller/CategoryController.js";

// route
const CategoryRoute = express.Router();

// http://localhost:8080/category/create
// {
// "categoryName" : "Dinner"
// }
CategoryRoute.post("/create", tokenCheck, logRequest, createCategoryController);

// http://localhost:8080/category/delete/6559887362171e8b05652958
CategoryRoute.delete(
  "/delete/:categoryId",
  tokenCheck,
  logRequest,
  deleteCategoryController
);

// http://localhost:8080/category/id/65598b31d0b7ab294f45ecf7
CategoryRoute.get(
  "/id/:categoryId",
  tokenCheck,
  logRequest,
  getByIdCategoryController
);

// http://localhost:8080/category/idList
CategoryRoute.get(
  "/idList",
  tokenCheck,
  logRequest,
  getCategoryIdListController
);

// http://localhost:8080/category/categorylist
CategoryRoute.get("/categoryList", tokenCheck, logRequest, getAllCategoryList);

// http://localhost:8080/category/idListDetails
// {
// "categoryName" : "snack"
// }
CategoryRoute.get(
  "/idListDetails",
  tokenCheck,
  logRequest,
  getCategoryDetailsController
);

export default CategoryRoute;
