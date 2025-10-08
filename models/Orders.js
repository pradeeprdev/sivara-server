const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  totalAmount: Number,
  status: { type: String, enum: ["pending", "shipped", "delivered", "cancelled"] },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Order", orderSchema);
