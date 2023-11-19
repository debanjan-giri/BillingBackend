import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// model
import AuthModel from "../model/AuthModel.js";

// create user credential,start subcription
export const AdminController = async (req, res) => {
  try {
    // user details from req.body
    const { username, password } = req.body;

    // validation
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

    // username security validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: "its not valid email",
      });
    }

    // password security validation
    if (password.length <= 7) {
      return res.status(400).json({
        success: false,
        message: "minimum password length 8",
      });
    }

    // create hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // create user
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
    console.log(error);
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
      "username password permission created"
    );

    // if invalid usename
    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: "invalid credential",
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
        { expiresIn: "1y" }
      );

      // final response
      res.status(200).json({
        success: true,
        message: "login success",
        token: token,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "contact your service provider",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// every time app startup check token,supsciption
export const logController = async (req, res) => {
  try {
    // get username from token
    const username = req.tokenDetails.data;

    // check DB if user is exist
    const findUser = await AuthModel.findOne({ username }).select(
      "created permission"
    );
    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // admin controller
    if (findUser.permission == false) {
      return res.status(400).json({
        success: false,
        message: "blocked by admin",
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

    // final response
    res.status(200).json({
      success: true,
      message: "access",
    });
  } catch (error) {
    console.log(error);
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
    if (!shopName || !shopAddress || !shopNumber || !shopGST) {
      return res.status(400).json({
        success: false,
        message: " all details are required",
      });
    }

    // identify token
    const username = req.tokenDetails.data;

    // find db
    const findUser = await AuthModel.findOne({ username }).select(
      "created permission"
    );

    // check user
    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // admin controller
    if (findUser.permission == false) {
      return res.status(400).json({
        success: false,
        message: "blocked by admin",
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
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// printer details of each owner
export const printerController = async (req, res) => {
  // header footer logo
  res.status(200).json({
    success: false,
    message: "code is empty",
  });
};
