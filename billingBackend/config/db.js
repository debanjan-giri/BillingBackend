import mongoose from "mongoose";

// MongoDB Connection
const connectDB = () => {
  try {
    mongoose.connect(`${process.env.MONGODB_URI}`).then(()=>{console.log(`database connected ✅`)});
    
  } catch (error) {
    console.log(`database error ❌ 
${error}`);
  }
};

export default connectDB;
