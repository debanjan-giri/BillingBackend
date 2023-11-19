import express from "express";

// middleware
import CheckLogin from "../middleware/CheckLoginMiddleware.js";
import logRequest from "../middleware/LoggerMiddleware.js";

// controller
import {
  createUnitController,
  deleteUnitController,
  getUnitController,
} from "../controller/UnitController.js";

// route
const UnitRoute = express.Router();

// http://localhost:8080/unit/create
// {
// "unitName" : "gram"
// }
UnitRoute.post("/create", CheckLogin, logRequest, createUnitController);

// http://localhost:8080/unit/view
UnitRoute.get("/view", CheckLogin, logRequest, getUnitController);

// http://localhost:8080/unit/delete/6559920ee98565ee3c7a3583
UnitRoute.delete(
  "/delete/:unitId",
  CheckLogin,
  logRequest,
  deleteUnitController
);

export default UnitRoute;
