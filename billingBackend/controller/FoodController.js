import mongoose from "mongoose";

// model
import AuthModel from "../model/AuthModel.js";
import FoodModel from "../model/FoodModel.js";
import CategoryModel from "../model/CategoryModel.js";
import UnitModel from "../model/UnitModel.js";

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

    const username = req.tokenDetails.data;

    // check DB if user is exist
    const findUser = await AuthModel.findOne({ username }).select(
      "created permission foodList"
    );

    // create food
    const createdFood = await FoodModel.findOneAndUpdate(
      {
        name: foodName,
        price: foodPrice,
        category: foodCategory,
        unit: foodUnit,
      },
      {
        name: foodName,
        price: foodPrice,
        category: foodCategory,
        unit: foodUnit,
      },
      {
        upsert: true, // Set to true to perform an upsert
        new: true, // Set to true to return the modified document (if upserted)
      }
    );

    const isFoodExist = findUser?.foodList.includes(createdFood._id);

    if (isFoodExist) {
      return res.status(409).json({
        success: false,
        message: "food is already Created",
      });
    }

    // store food it within category
    const updatedCategory = await CategoryModel.findOneAndUpdate(
      { _id: foodCategory },
      { $push: { foods: createdFood._id } },
      { new: true }
    );

    const updatedUnit = await UnitModel.findOneAndUpdate(
      { _id: foodUnit },
      { $push: { foods: createdFood._id } },
      { new: true }
    );

    if (!updatedCategory || !updatedUnit) {
      await FoodModel.findByIdAndDelete(createdFood._id);
      return res.status(404).json({
        success: false,
        message: "Category or Unit not found",
      });
    }

    findUser.foodList.push(createdFood._id);
    await findUser.save();

    // final response
    res.status(200).json({
      success: true,
      message: "food created",
    });
  } catch (error) {

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

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getFoodList = async (req, res) => {
  try {
    const username = req.tokenDetails.data;

    // fetch current user
    // Fetch FoodList
    const findUser = await AuthModel.findOne({ username })
      .select("foodList")
      .populate({
        path: "foodList",
        select: "name price unit category",
        populate: [
          {
            path: "category",
            select: "name -_id", // Only select the 'name' field from the 'Category' model
          },
          {
            path: "unit",
            select: "name -_id", // Only select the 'name' field from the 'Unit' model
          },
        ],
      });

    // change the response
    const foodList = findUser.foodList.map((item) => {
      const { _id, price, name, category, unit } = item;
      return {
        _id,
        price,
        name,
        category: category ? category.name : undefined,
        unit: unit ? unit.name : undefined,
      };
    });

    res.status(200).json({
      success: true,
      message: foodList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const editFoodControlller = async (req, res) => {
  try {
    const { foodId, categoryId, unitId, foodName, foodPrice } = req.body;
    if (!foodId || !foodName || !categoryId || !unitId || !foodPrice) {
      return res.status(400).json({
        success: false,
        message:
          "All feild required \n [foodId, foodName, categoryId, unitId, foodPrice]",
      });
    }

    // Get username from token
    const username = req.tokenDetails.data;

    // Check if user exists in the database
    const user = await AuthModel.findOne({ username }).select(
      "created permission foodList categoryList unitList"
    );

    // Check if the food exists in the current user's foodList
    const isFoodExist = user.foodList.includes(foodId);

    // Check if the Food ID belongs to the current user or not
    if (!isFoodExist) {
      return res.status(401).json({
        success: true,
        message: "Food does not belong to you",
      });
    }

    // Check if the food exists in the current user's categoryList
    const isCategoryExist = user.categoryList.includes(categoryId);

    // Check if the category ID belongs to the current user or not
    if (!isCategoryExist) {
      return res.status(401).json({
        success: true,
        message: "Category does not belong to you",
      });
    }

    // Check if the Unit exists in the current user's unitList
    const isUnitExist = user.unitList.includes(unitId);

    // Check if the unit ID belongs to the current user or not
    if (!isUnitExist) {
      return res.status(401).json({
        success: true,
        message: "Unit does not belong to you",
      });
    }

    // Food Update query
    const updatedFood = await FoodModel.findOneAndUpdate(
      { _id: foodId }, // Filter by food ID and old category ID
      {
        $set: {
          category: categoryId,
          unit: unitId,
          name: foodName,
          price: foodPrice,
        },
      } // Update the category ID
      // { new: true } // Return the modified document after update
    );

    // Final response
    res.status(200).json({
      success: true,
      message: "Food edited Successfully",
      updatedFood,
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const removeFoodController = async (req, res) => {
  try {
    const { foodId } = req.body;
    // Get username from token
    const username = req.tokenDetails.data;
    // Check if user exists in the database
    const user = await AuthModel.findOneAndUpdate(
      {
        username: username,
        foodList: foodId,
      },
      { $pull: { foodList: foodId } },
      { new: true }
    );

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Some error occur while Remove Food",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food Remove successfully",
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};
