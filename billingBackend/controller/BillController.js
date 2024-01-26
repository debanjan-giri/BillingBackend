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

    // Check if the user exists and populate the billList field
    const findUser = await AuthModel.findOne({ username })
      .select("created permission billList")
      .populate("billList", "_id date totalPrice");

    // if user not found
    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check admin permissions
    if (!findUser.permission) {
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

    // Filter bills for the requested month
    const monthBills = findUser.billList.filter((bill) => {
      return bill.date >= startOfMonth && bill.date <= endOfMonth;
    });

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

    // Check if the user exists and populate the billList field
    const findUser = await AuthModel.findOne({ username })
      .select("created permission billList")
      .populate({
        path: "billList",
        match: {
          date: {
            $gte: new Date(req.params.day),
            $lt: new Date(
              new Date(req.params.day).setDate(
                new Date(req.params.day).getDate() + 1
              )
            ),
          },
        },
        select: "_id date totalPrice",
      });

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

    // Extracted user bills from populated billList
    const dayBills = findUser.billList;

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

    // Check if the user exists and populate the billList field
    const findUser = await AuthModel.findOne({ username })
      .select("created permission billList")
      .populate({
        path: "billList",
        match: {
          date: {
            $gte: new Date(req.params.startDate),
            $lte: new Date(req.params.endDate),
          },
        },
        select: "_id date totalPrice",
      });

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

    // Extracted user bills from populated billList
    const dateRangeBills = findUser.billList;

    // Calculate total amount
    const totalAmountForDateRange = dateRangeBills.reduce(
      (total, bill) => total + bill.totalPrice,
      0
    );

    // Calculate total bills generated
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

// start date to end date param bill details
export const dateRangeBillFullDetailsController = async (req, res) => {
  try {
    // Get username from the token
    const username = req.tokenDetails.data;

    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate);
    endDate.setHours(23, 59, 59, 999); // Set time to 23:59:59.999

    // Check if the user exists and populate the billList field
    const findUser = await AuthModel.findOne({ username })
      .select("billList")
      .populate({
        path: "billList",
        match: {
          date: {
            $gte: startDate, // Filter bills with date greater than or equal to startDate
            $lte: endDate, // Filter bills with date less than or equal to endDate
          },
        },
        select: "_id date totalPrice foodList",
        populate: { path: "foodList.food" }, // Populate foodList field of each bill with food details
      });

    // Extracted user bills from populated billList
    const dateRangeBills = findUser.billList;

    // Format dates of bills to a human-readable format and extract food details with quantities
    const formattedData = dateRangeBills.map((bill) => ({
      _id: bill._id,
      date: bill.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }),
      orderTime: bill.date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      totalPrice: bill.totalPrice,
      foodDetails: bill.foodList.map((foodItem) => ({
        foodName: foodItem.food.name,
        price: foodItem.food.price,
        quantity: foodItem.quantity,
      })),
    }));

    // Final response
    res.status(200).json({
      success: true,
      message: "bill reported successfully fetch",
      data: formattedData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
