import mongoose from "mongoose";
const categorySchema = new mongoose.Schema({
  name: String,
  description: String
});

export default mongoose.model("Category", categorySchema);
