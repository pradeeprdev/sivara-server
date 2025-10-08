import { Schema, model } from "mongoose";

const adminSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

export default model("Admin", adminSchema);