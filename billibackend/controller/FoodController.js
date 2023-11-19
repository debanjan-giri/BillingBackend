import mongoose from "mongoose";

// model
import AuthModel from "../model/AuthModel.js";
import FoodModel from "../model/FoodModel.js";
import CategoryModel from "../model/CategoryModel.js";

// create food and store food id to category
export const createFoodController = async (req, res) => {
  try {
    const { foodName, foodPrice, foodUnit, foodCategory } = req.body;

    // validation
    if (!foodName || !foodPrice || !foodUnit || !foodCategory) {
      res.status(400).json({
        success: false,
        message: "all details are required",
      });
    }
    // get username from token
    const username = req.tokenDetails.data;

    // check DB if user is exist
    const findUser = await AuthModel.findOne({ username }).select(
      "created permission "
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

    // create food
    const createdFood = await FoodModel.create({
      name: foodName,
      price: foodPrice,
      category: foodCategory,
      unit: foodUnit,
    });

    // store food it within category
    const updatedCategory = await CategoryModel.findOneAndUpdate(
      { _id: foodCategory },
      { $push: { foods: createdFood._id } },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // final response
    res.status(200).json({
      success: true,
      message: "food created",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// delete food and delete id from category
export const deleteFoodController = async (req, res) => {
  try {
    const foodId = req.params.foodId;

    // validation
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    // get username from token
    const username = req.tokenDetails.data;

    // check DB if user exists
    const findUser = await AuthModel.findOne({ username }).select(
      "created permission categoryList"
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

    // Delete food
    const deletedFood = await FoodModel.findByIdAndDelete(foodId);
    if (!deletedFood) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    // Remove the food ID from category
    const updatedCategory = await CategoryModel.findOneAndUpdate(
      { foods: foodId },
      { $pull: { foods: foodId } },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // final response
    res.status(200).json({
      success: true,
      message: "Food deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
