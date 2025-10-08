const appliedCouponSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }
});

export default mongoose.model("AppliedCoupon", appliedCouponSchema);
