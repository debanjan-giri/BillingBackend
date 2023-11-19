import express from "express";

// middleware
import validation from "../middleware/ValidationMiddleware.js";
import CheckLogin from "../middleware/CheckLoginMiddleware.js";
import logRequest from "../middleware/LoggerMiddleware.js";

// auth controller
import {
  AdminController,
  loginController,
  logController,
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
AuthRoute.post("/create", logRequest, validation, AdminController);

// http://localhost:8080/auth/login
// {
// "username" : "devposto@gmail.com",
// "password" : "devposto"
// }
AuthRoute.post("/login", logRequest, validation, loginController);

// http://localhost:8080/auth/access
// req.header.Authorization ( fill the token )
AuthRoute.get("/access", logRequest, CheckLogin, logController);

// http://localhost:8080/auth/shopUpdate
// {
//   "shopName" : "posto",
//   "shopAddress" : "india",
//   "shopNumber" : "12345678",
//   "shopGST" : "1234"
//   }
AuthRoute.post("/shopUpdate", logRequest, CheckLogin, shopController);

// http://localhost:8080/auth/printerUpdate
// code is empty (header footer image)
// work is incomplete
AuthRoute.post("/printerUpdate", logRequest, CheckLogin, printerController);

export default AuthRoute;
