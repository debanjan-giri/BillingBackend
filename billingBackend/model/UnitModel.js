import mongoose from "mongoose";

const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  foods: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
    },
  ],
});

export default mongoose.model("Unit", unitSchema);
