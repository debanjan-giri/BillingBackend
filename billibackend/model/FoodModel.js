import mongoose from "mongoose";

// create schema
const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
    required: true,
  },
});

export default mongoose.model("Food", foodSchema);
