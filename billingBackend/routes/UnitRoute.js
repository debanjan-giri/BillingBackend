import express from "express";

// middleware
import tokenCheck from "../middleware/tokenCheckMiddleware.js";
import logRequest from "../middleware/LoggerMiddleware.js";

// controller
import {
  createUnitController,
  deleteUnitController,
  editUnitController,
  getUnitController,
  removeUnitController,
} from "../controller/UnitController.js";

// route
const UnitRoute = express.Router();

// http://localhost:8080/unit/create
// {
// "unitName" : "gram"
// }
UnitRoute.post("/create", tokenCheck, logRequest, createUnitController);

// http://localhost:8080/unit/create
// {
// "unitName" : "gram"
// "unitId" : "87786868cv766966"
// }
UnitRoute.post("/edit", tokenCheck, logRequest, editUnitController);

// http://localhost:8080/unit/view
UnitRoute.get("/unit_list", tokenCheck, logRequest, getUnitController);

// http://localhost:8080/unit/delete/6559920ee98565ee3c7a3583
UnitRoute.delete(
  "/delete/:unitId",
  tokenCheck,
  logRequest,
  deleteUnitController
);

// http://localhost:8080/unit/remove
// {
//   unitId:""
// }
UnitRoute.post(
  "/remove",
  tokenCheck,
  logRequest,
  removeUnitController
);

export default UnitRoute;
