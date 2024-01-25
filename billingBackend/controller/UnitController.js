import mongoose from "mongoose";

// model
import AuthModel from "../model/AuthModel.js";
import UnitModel from "../model/UnitModel.js";
import FoodModel from "../model/FoodModel.js";

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

// Edit Unit Controller
export const editUnitController = async (req, res) => {
  try {
    const { unitName, unitId } = req.body;

    // Validation: Check if Unit name and id is provided!
    if (!unitName || !unitId) {
      return res.status(400).json({
        success: false,
        message: "Unit name and id is required",
      });
    }

    // Get username from token
    const username = req.tokenDetails.data;

    // Check if user exists in the database
    const findUser = await AuthModel.findOne({ username }).select(
      "created permission unitList foodList"
    );
    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin Controller: Check if user has admin privileges
    if (findUser.permission == false) {
      return res.status(400).json({
        success: false,
        message: "Blocked by admin",
      });
    }

    // Check Year Subscription: Verify if user's subscription is still valid
    const userAccessYear = new Date(findUser.created);
    userAccessYear.setFullYear(userAccessYear.getFullYear() + 1);
    if (new Date() > userAccessYear) {
      return res.status(400).json({
        success: false,
        message: "Account expired",
      });
    }

    // Check if the Unit exists in the current user's unitList
    const isUnitExist = findUser.unitList.includes(unitId);

    // Check if the Unit ID belongs to the current user or not
    if (!isUnitExist) {
      return res.status(401).json({
        success: true,
        message: "Unit does not belong to you",
      });
    }

    // Create or Update unit: Upsert the unit in the UnitModel
    const createdunit = await UnitModel.findOneAndUpdate(
      {
        name: unitName,
      },
      {
        name: unitName,
      },
      {
        upsert: true, // Set to true to perform an upsert
        new: true, // Set to true to return the modified document (if upserted)
      }
    );

    // Update the Food collection with the new Unit ID
    for (const food of findUser.foodList) {
      await FoodModel.findOneAndUpdate(
        { _id: food._id, unit: unitId }, // Filter by food ID and old unit ID
        { $set: { unit: createdunit._id } }, // Update the unit ID
        { new: true } // Return the modified document after update
      );
    }

    // Replace the previous unit ID with the new unit ID in the auth collection
    const unitIndex = findUser.unitList.indexOf(unitId);
    findUser.unitList.splice(unitIndex, 1);
    findUser.unitList.push(createdunit._id);
    await findUser.save();

    // Final response
    res.status(200).json({
      success: true,
      message: "Unit Edited Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
