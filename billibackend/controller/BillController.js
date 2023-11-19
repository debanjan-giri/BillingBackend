import mongoose from "mongoose";

// model
import AuthModel from "../model/AuthModel.js";
import BillModel from "../model/BillModel.js";

// create bill and update user billlist
export const createBillController = async (req, res) => {
  try {
    const { totalPrice, foodList } = req.body;

    // validation
    if (!totalPrice || !foodList) {
      return res.status(400).json({
        success: false,
        message: "details are required",
      });
    }

    // get username from token
    const username = req.tokenDetails.data;

    // check DB if user is exist
    const findUser = await AuthModel.findOne({ username }).select(
      "created permission billList"
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

    // create new bill
    const newBill = await BillModel.create({
      totalPrice,
      foodList,
    });

    // bill id store within user
    findUser.billList.push(newBill._id);
    await findUser.save();

    // final response
    res.status(200).json({
      success: true,
      message: "bill create succefully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// bill by id details (food name price date total)
export const billDetailsByIdController = async (req, res) => {
  try {
    // Get the bill ID
    const billId = req.params.billId;

    // Check if the bill ID is valid
    if (!billId || !mongoose.Types.ObjectId.isValid(billId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill ID",
      });
    }

    // Find the bill by ID
    const bill = await BillModel.findById(billId).populate({
      path: "foodList.food",
      model: "Food",
    });

    // Check if the bill exists
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // Format date
    const formattedDate = bill.date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Format time
    const formattedTime = bill.date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Extract food details
    const foodDetails = bill.foodList.map((food) => ({
      name: food.food.name,
      price: food.price,
      quantity: food.quantity,
    }));

    // Response bill details
    res.status(200).json({
      success: true,
      data: {
        _id: bill._id,
        date: formattedDate,
        time: formattedTime,
        totalPrice: bill.totalPrice,
        foodList: foodDetails,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// motnth param bill details
export const monthBillDetailsController = async (req, res) => {
  try {
    // Get username from the token
    const username = req.tokenDetails.data;

    // Check if the user exists
    const findUser = await AuthModel.findOne({ username }).select(
      "created permission billList"
    );

    // if user not found
    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check admin permissions
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

    // Get the month
    const requestedMonth = req.params.month;

    // Convert month name to a number
    const monthIndex = new Date(
      Date.parse(`${requestedMonth} 1, 2000`)
    ).getMonth();

    if (isNaN(monthIndex)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format",
      });
    }

    // Start of the requested month
    const startOfMonth = new Date(new Date().getFullYear(), monthIndex, 1);

    // End of the requested month
    const endOfMonth = new Date(new Date().getFullYear(), monthIndex + 1, 0);

    // Find bills for between requested month
    const monthBills = await BillModel.find({
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    }).select("_id date totalPrice");

    // Calculate total amount for the month
    const totalAmountForMonth = monthBills.reduce(
      (total, bill) => total + bill.totalPrice,
      0
    );

    // Count bills generated in this month
    const billCountForMonth = monthBills.length;

    // Format dates
    const formattedMonthBills = monthBills.map((bill) => ({
      _id: bill._id,
      date: bill.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      orderTime: bill.date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      totalPrice: bill.totalPrice,
    }));

    // Final response
    res.status(200).json({
      success: true,
      data: {
        totalAmount: totalAmountForMonth,
        billCount: billCountForMonth,
        details: formattedMonthBills,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// day param bill details
export const dayBillDetailsController = async (req, res) => {
  try {
    // Get username from the token
    const username = req.tokenDetails.data;

    // Check if the user exists
    const findUser = await AuthModel.findOne({ username }).select(
      "created permission billList"
    );

    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check admin permissions
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

    // Get the day
    const requestedDay = req.params.day;

    // create Date object
    const startOfDay = new Date(requestedDay);

    // Check if the parsed date is valid
    if (isNaN(startOfDay.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Today + 1 = end of the day
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Find bills for the requested day
    const dayBills = await BillModel.find({
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).select("_id date totalPrice");

    // Calculate total bill for the day
    const totalBillForDay = dayBills.reduce(
      (total, bill) => total + bill.totalPrice,
      0
    );

    // Count of bills generated
    const billCount = dayBills.length;

    // Format dates
    const formattedDayBills = dayBills.map((bill) => ({
      _id: bill._id,
      date: bill.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      orderTime: bill.date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      totalPrice: bill.totalPrice,
    }));

    // Final response
    res.status(200).json({
      success: true,
      data: {
        totalAmount: totalBillForDay,
        billCount: billCount,
        details: formattedDayBills,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// start date to end date param bill details
export const dateRangeBillDetailsController = async (req, res) => {
  try {
    // Get username from the token
    const username = req.tokenDetails.data;

    // Check if the user exists
    const findUser = await AuthModel.findOne({ username }).select(
      "created permission billList"
    );

    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check admin permissions
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

    // Get start and end dates
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate);

    // Check if the dates are valid
    if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range",
      });
    }

    // Find bills for the specified date range
    const dateRangeBills = await BillModel.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).select("_id date totalPrice");

    // Calculate total amount
    const totalAmountForDateRange = dateRangeBills.reduce(
      (total, bill) => total + bill.totalPrice,
      0
    );

    // claculate total bill
    const totalBillsGenerated = dateRangeBills.length;

    // Format dates
    const formattedDateRangeBills = dateRangeBills.map((bill) => ({
      _id: bill._id,
      date: bill.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      orderTime: bill.date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      totalPrice: bill.totalPrice,
    }));

    // Final response
    res.status(200).json({
      success: true,
      data: {
        totalAmount: totalAmountForDateRange,
        totalBills: totalBillsGenerated,
        details: formattedDateRangeBills,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
