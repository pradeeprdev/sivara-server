import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  name: String,
  description: String,
  imageUrl: String,
  price: Number,
  stockQuantity: Number,
  status: { type: String, enum: ["active", "inactive", "out_of_stock"] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Product", productSchema);
