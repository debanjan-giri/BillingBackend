import express from "express";

// middleware
import validation from "../middleware/ValidationMiddleware.js";
import tokenCheck from "../middleware/tokenCheckMiddleware.js";
import logger from "../middleware/LoggerMiddleware.js";
import subscriptionPermission from "../middleware/subscriptionPermission.js";

// auth controller
import {
  AdminController,
  loginController,
  startupController,
  shopController,
  printerController,
} from "../controller/AuthController.js";

// express route
const AuthRoute = express.Router();

// http://localhost:8080/auth/create
// {
// "username" : "devposto@gmail.com",
// "password" : "devposto"
// }
AuthRoute.post("/create", logger, validation, AdminController);

// http://localhost:8080/auth/login
// {
// "username" : "devposto@gmail.com",
// "password" : "devposto"
// }
AuthRoute.post("/login", validation, loginController);

// http://localhost:8080/auth/access
// req.header.Authorization ( fill the token )
AuthRoute.get(
  "/appStartup",
  logger,
  tokenCheck,
  subscriptionPermission,
  startupController
);

// http://localhost:8080/auth/shopUpdate
// {
//   "shopName" : "posto",
//   "shopAddress" : "india",
//   "shopNumber" : "12345678",
//   "shopGST" : "1234"
//   }
AuthRoute.post(
  "/shopUpdate",
  logger,
  tokenCheck,
  subscriptionPermission,
  shopController
);

// http://localhost:8080/auth/printerUpdate
AuthRoute.post(
  "/printerUpdate",
  logger,
  tokenCheck,
  subscriptionPermission,
  printerController
);

export default AuthRoute;
