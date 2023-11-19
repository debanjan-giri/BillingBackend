import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    unique: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  foodList: [
    {
      food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
});

billSchema.index({ date: 1 });

export default mongoose.model("Bill", billSchema);
