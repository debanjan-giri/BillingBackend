import mongoose from "mongoose";

const printerSchema = new mongoose.Schema(
  {
    header: {
      type: String,
      required: true,
    },
    footer: {
      type: String,
      required: true,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Printer", printerSchema);
