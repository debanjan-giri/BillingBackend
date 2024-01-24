import mongoose from "mongoose";

// model
import AuthModel from "../model/AuthModel.js";
import UnitModel from "../model/UnitModel.js";

// create unit and unit id store to user
export const createUnitController = async (req, res) => {
  try {
    const { unitName } = req.body;

    console.log(unitName);

    // validation
    if (!unitName) {
      return res.status(400).json({
        success: false,
        message: " unit name required",
      });
    }

    // get username from token
    const username = req.tokenDetails.data;

    // check DB if user is exist
    const findUser = await AuthModel.findOne({ username }).select(
      "created permission unitList"
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
    // create unit
    const newUnit = await UnitModel.findOneAndUpdate(
      { name: unitName },
      {
        name: unitName,
      },
      {
        upsert: true, // Set to true to perform an upsert
        new: true, // Set to true to return the modified document (if upserted)
      }
    );

    // check  if Unit pre exist In the current User
    const isUnitExist = findUser.unitList.includes(newUnit._id);

    if (isUnitExist) {
      return res.status(409).json({
        success: true,
        message: "Unit already Exist",
      });
    }
    // also add unit id within user
    findUser.unitList.push(newUnit._id);
    await findUser.save();

    // final response
    res.status(200).json({
      success: true,
      message: "unit created",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// delete unit and delete id within user
export const deleteUnitController = async (req, res) => {
  try {
    const unitId = req.params.unitId;

    // validation
    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid unit ID",
      });
    }

    // get username from token
    const username = req.tokenDetails.data;

    // check DB if user is exist
    const findUser = await AuthModel.findOne({ username }).select(
      "created permission unitList"
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
    // Delete unit
    const deletedUnit = await UnitModel.findByIdAndDelete(unitId);

    if (!deletedUnit) {
      return res.status(404).json({
        success: false,
        message: "unit not found",
      });
    }

    // also delete from user unit list
    findUser.unitList = findUser.unitList.filter(
      (unit) => unit.toString() !== unitId
    );
    await findUser.save();

    // final response
    res.status(200).json({
      success: true,
      message: "unit deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// get unit name,id list
export const getUnitController = async (req, res) => {
  try {
    // get username from token
    const username = req.tokenDetails.data;

    // check DB if user is exist
    const findUser = await AuthModel.findOne({ username })
      .select("created permission unitList")
      .populate({
        path: "unitList",
        select: "name _id",
      });

    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // admin controller
    if (findUser.permission === false) {
      return res.status(400).json({
        success: false,
        message: "Blocked by admin",
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
      data: findUser.unitList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
