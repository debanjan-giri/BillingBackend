import mongoose from "mongoose";

const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Unit", unitSchema);
