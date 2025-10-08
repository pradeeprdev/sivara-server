import { config } from "dotenv";
import mongoose from "mongoose";
config({
  path:'./.env',
});


export const connectDB = async()=>{
  const MONGO_URI = process.env.MONGO_URI;
  try{
      const connect = await mongoose.connect(MONGO_URI);
      console.log("connect")
      
  }
  catch(error)
  {
      console.log(error);
  }
};
connectDB();

