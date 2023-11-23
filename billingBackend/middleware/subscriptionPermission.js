import AuthModel from "../model/AuthModel.js";

// token usename subscription & permission check
const subscriptionPermission = async (req, res, next) => {
  try {
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

    req.tokenDB = findUser;

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "app access denied",
    });
  }
};

export default subscriptionPermission;
