import mongoose from "mongoose";
const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  street: String,
  city: String,
  state: String,
  country: String,
  pincode: String,
  type: { type: String, enum: ["home", "office", "other"] }
});

export default mongoose.model("Address", addressSchema);
