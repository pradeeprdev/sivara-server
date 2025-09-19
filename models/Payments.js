const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  paymentMethod: { type: String, enum: ["cod", "credit_card", "debit_card", "upi", "netbanking"] },
  transactionId: String,
  amount: Number,
  status: { type: String, enum: ["pending", "success", "failed"] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Payment", paymentSchema);
