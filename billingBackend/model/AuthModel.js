import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true, // <= indexing
    },
    password: {
      type: String,
      required: true,
    },
    permission: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    created: {
      type: Date,
      default: Date.now,
      index: true,
    },
    shopDetails: {
      name: String,
      address: String,
      number: String,
      GST: String,
    },
    PrinterDetails: {
      header: String,
      footer: String,
      logo: Buffer,
    },
    categoryList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    billList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bill",
      },
    ],
    unitList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
      },
    ],
    foodList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
      },
    ],
  },
  { timestamps: true }
);

// indexing
authSchema.index({ permission: 1 });

export default mongoose.model("Auth", authSchema);
