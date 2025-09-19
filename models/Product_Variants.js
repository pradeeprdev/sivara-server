const productVariantSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  variantName: String,
  price: Number,
  stockQuantity: Number
});

export default mongoose.model("ProductVariant", productVariantSchema);
