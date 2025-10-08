import Product from "../models/Products.js";
import Category from "../models/Categories.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";

// Create Product under a Category
export const createProduct = catchAsyncError(async (req, res, next) => {
  const { name, description, price, stock, image, brand, discount } = req.body;
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) return next(new ErrorHandler("Category not found", 404));
   const user = req.user._id;
  const product = await Product.create({
    category: categoryId,
    name,
    description,
    price,
    stock,
    image,
    brand,
    discount,
    user
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});

// Get All Products
export const getAllProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find().populate("category", "name");
  res.status(200).json({ success: true, products });
});

//Get Single Product by ID
export const getProductById = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("category", "name");
  if (!product) return next(new ErrorHandler("Product not found", 404));
  res.status(200).json({ success: true, product });
});

// Update Product
export const updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ success: true, product });
});

//  Delete Product
export const deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  await product.deleteOne();
  res.status(200).json({ success: true, message: "Product deleted successfully" });
});

// Get Products by Category ID
export const getProductsByCategory = catchAsyncError(async (req, res, next) => {
  const { categoryId } = req.params;
  const category = await Category.findById(categoryId);
  if (!category) return next(new ErrorHandler("Category not found", 404));

  const products = await Product.find({ category: categoryId });
  res.status(200).json({ success: true, category: category.name, products });
});
