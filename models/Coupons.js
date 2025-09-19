const couponSchema = new mongoose.Schema({
  code: String,
  discountType: { type: String, enum: ["flat", "percentage"] },
  discountValue: Number,
  minOrderValue: Number,
  validFrom: Date,
  validTo: Date,
  usageLimit: Number
});

export default mongoose.model("Coupon", couponSchema);
