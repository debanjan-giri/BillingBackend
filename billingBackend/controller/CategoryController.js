import mongoose from "mongoose";

// model
import AuthModel from "../model/AuthModel.js";
import CategoryModel from "../model/CategoryModel.js";

// create category and store id with user
export const createCategoryController = async (req, res) => {
  try {
    const { categoryName } = req.body;
    // validation
    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: " category are required",
      });
    }

    // get username from token
    const username = req.tokenDetails.data;

    // check DB if user is exist
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
    // create category
    const createdCategory = await CategoryModel.findOneAndUpdate(
      {
        name: categoryName,
      },
      {
        name: categoryName,
      },
      {
        upsert: true, // Set to true to perform an upsert
        new: true, // Set to true to return the modified document (if upserted)
      }
    );

    // check  if category pre exist In the current User
    const isCategoryExist = findUser.categoryList.includes(createdCategory._id);

    if (isCategoryExist) {
      return res.status(409).json({
        success: true,
        message: "category already Exist",
      });
    }

    // store within user
    findUser.categoryList.push(createdCategory._id);
    await findUser.save();

    // final response
    res.status(200).json({
      success: true,
      message: "category created",
      CategoryId: createdCategory._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// delete category and remove category id from user
export const deleteCategoryController = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // validation
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // get username from token
    const username = req.tokenDetails.data;

    // check DB if user is exist
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
    // Delete category
    const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // save user categorylist id
    findUser.categoryList = findUser.categoryList.filter(
      (categoryId) => categoryId.toString() !== deletedCategory._id.toString()
    );
    await findUser.save();

    // final response
    res.status(200).json({
      success: true,
      message: "Category deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// get token,categorylist,foodlist,unitlist (one db call)
export const getCategoryDetailsController = async (req, res) => {
  try {
    // get username from token
    const username = req.tokenDetails.data;

    // check DB if user is exist
    const findUser = await AuthModel.findOne({ username })
      .select("created permission categoryList")
      .populate({
        path: "categoryList",
        select: "-__v -_id",
        populate: {
          path: "foods",
          select: "name price unit _id category",
        },
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
      data: findUser.categoryList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// get category by id food view
export const getByIdCategoryController = async (req, res) => {
  try {
    // Get category ID
    const categoryId = req.params.categoryId;

    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Get username from the token
    const username = req.tokenDetails.data;

    // Check DB if the user exists
    const findUser = await AuthModel.findOne({ username })
      .select("created permission categoryList")
      .populate({
        path: "categoryList",
        select: "-__v",
        populate: {
          path: "foods",
          select: "name price unit _id",
          populate: {
            path: "unit",
            select: "name -_id",
          },
        },
      });

    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin controller
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

    // Find the category by ID
    const category = findUser.categoryList.find(
      (category) => category && category._id.toString() === categoryId
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Unit {object name:kg} view like food {unit:kg}
    const structureView = {
      name: category.name,
      foods: category.foods.map((food) => ({
        foodId: food._id,
        name: food.name,
        price: food.price,
        unit: food.unit ? food.unit.name : null,
      })),
    };

    // final responce
    res.status(200).json({
      success: true,
      data: structureView,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// only list of category id
export const getCategoryIdListController = async (req, res) => {
  try {
    // Get username from the token
    const username = req.tokenDetails.data;

    // Check DB if the user exists
    const findUser = await AuthModel.findOne({ username }).select(
      "created permission categoryList"
    );

    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin controller
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

    // Extract only the category IDs
    const categoryIds = findUser.categoryList.map((category) => category._id);

    // final response
    res.status(200).json({
      success: true,
      data: categoryIds,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//fetch all category lists
export const getAllCategoryList = async (req, res) => {
  try {
    // Get username from the token
    const username = req.tokenDetails.data;

    // Check DB if the user exists
    const findUser = await AuthModel.findOne({ username })
      .select("created permission categoryList")
      .populate({ path: "categoryList", select: "_id name" });

    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin controller
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

    // Extract only the category IDs
    const categoryLists = findUser.categoryList;

    // final response
    res.status(200).json({
      success: true,
      message: "success fully fetch Category Lists",
      data: categoryLists,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
