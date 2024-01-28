import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import AuthModel from "../model/AuthModel.js";

// create user credential & start subcription
export const AdminController = async (req, res) => {
  try {
    // input details from req.body
    const { username, password } = req.body;

    // input validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // check existing user
    const checkUser = await AuthModel.findOne({ username }).select("username");
    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: "user already exists",
      });
    }

    // username (email) validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: "its not valid email",
      });
    }

    // password security validation
    if (password.length <= 5) {
      return res.status(400).json({
        success: false,
        message: "minimum password length 6",
      });
    }

    // create hash password
    const salt = await bcrypt.genSalt(5);
    const hashPassword = await bcrypt.hash(password, salt);

    // create new user
    await AuthModel.create({
      username,
      password: hashPassword,
      permission: true,
    });

    // final response
    res.status(200).json({
      success: true,
      message: "user created",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// user login,device token store,supcription check
export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;

    // validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // check DB
    const findUser = await AuthModel.findOne({ username }).select(
      "username password permission shopDetails created"
    );

    // if invalid usename
    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: "User Not Found \n please register first",
      });
    }

    // Check year subscription
    const userAccessYear = new Date(findUser.created);
    userAccessYear.setFullYear(userAccessYear.getFullYear() + 1);
    if (new Date() > userAccessYear) {
      return res.status(400).json({
        success: false,
        message: "Account expired",
      });
    }

    // admin permission
    if (findUser.permission) {
      // after compare password with DB password
      const passwordMatch = await new Promise((resolve, reject) => {
        bcrypt.compare(password, findUser.password, (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      // Passwords do not match
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }
      // token generate
      const token = jwt.sign(
        {
          data: username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "365d" }
      );

      // final response
      res.status(200).json({
        success: true,
        message: "login success",
        data: findUser.shopDetails,
        token: token,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "contact your service provider",
      });
    }
  } catch (error) {
    print(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// every time app open ,create a new token
export const startupController = async (req, res) => {
  try {
    // previous token username
    const username = req.tokenDetails.data;

    // token generate
    const token = jwt.sign(
      {
        data: username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // final response
    res.status(200).json({
      success: true,
      message: "access",
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// user details save
export const shopController = async (req, res) => {
  try {
    const { shopName, shopAddress, shopNumber, shopGST } = req.body;

    // validation
    if (!shopName || !shopAddress || !shopNumber) {
      return res.status(400).json({
        success: false,
        message:
          " all details are required \n [ shopName, shopAddress, shopNumber]",
      });
    }

    // appAccess middleware
    const findUser = req.tokenDB;

    // Update shop details
    findUser.shopDetails = {
      name: shopName,
      address: shopAddress,
      number: shopNumber,
      GST: shopGST,
    };
    await findUser.save();

    // final resopnse
    res.status(200).json({
      success: true,
      message: "Shop details update",
      data: findUser?.shopDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const shopDetailsController = async (req, res) => {
  try {
    // Get username from token
    const username = req.tokenDetails.data;

    // fetch user
    const user = await AuthModel.findOne({ username }).select(
      "created permission shopDetails"
    );

    if (!user.shopDetails.name) {
      return res.status(404).json({
        success: false,
        message: "shop details not found",
      });
    }

    // final response
    res.status(200).json({
      success: true,
      message: "shop details fetch successfully",
      data: user.shopDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// printer details of each owner
export const printerController = async (req, res) => {
  try {
    const { header, footer } = req.body;

    // appAccess middleware
    const findUser = req.DB;

    // Update printer details
    findUser.PrinterDetails = {
      header,
      footer,
    };
    await findUser.save();

    // final response
    res.status(200).json({
      success: true,
      message: "data saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
