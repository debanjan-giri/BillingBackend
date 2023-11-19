import express from "express";

// middleware
import CheckLogin from "../middleware/CheckLoginMiddleware.js";
import logRequest from "../middleware/LoggerMiddleware.js";

// controller
import {
  createBillController,
  billDetailsByIdController,
  dayBillDetailsController,
  monthBillDetailsController,
  dateRangeBillDetailsController,
} from "../controller/BillController.js";

// route
const BillRoute = express.Router();

// http://localhost:8080/bill/create

// {
//   "totalPrice" : 6767,
//   "foodList" : [
//       {
//         "food" : "6558195edc7b735a1aaa3c23" ,
//         "quantity" : 4,
//         "price" : 67523
//       }
//   ]
// }

BillRoute.post("/create", CheckLogin, logRequest, createBillController);

// http://localhost:8080/bill/day/2023-11-19
BillRoute.get("/day/:day", CheckLogin, logRequest, dayBillDetailsController);

// http://localhost:8080/bill/id/655858f6b09f6d95dcec5865
BillRoute.get("/id/:billId", CheckLogin, logRequest, billDetailsByIdController);

// http://localhost:8080/bill/month/nov
BillRoute.get(
  "/month/:month",
  CheckLogin,
  logRequest,
  monthBillDetailsController
);

// http://localhost:8080/bill/date/2023-11-12/2023-12-26
BillRoute.get(
  "/date/:startDate/:endDate",
  CheckLogin,
  logRequest,
  dateRangeBillDetailsController
);

export default BillRoute;
