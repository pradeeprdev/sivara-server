// controllers/categoryController.js
import Category from "../models/Categories.js";
import Product from "../models/Products.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";

// Create Category
export const createCategory = catchAsyncError(async (req, res, next) => {
  
  const { name, description, image } = req.body;
  const user = req.user._id;
  const category = await Category.create({ name, description, image,user });
  res.status(201).json({ success: true, category });
});

//  Get All Categories
export const getCategories = catchAsyncError(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({ success: true, categories });
});

//  Get Single Category with its Products
export const getCategoryWithProducts = catchAsyncError(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorHandler("Category not found", 404));

  const products = await Product.find({ category: req.params.id });
  res.status(200).json({ success: true, category, products });
});

//  Update Category
export const updateCategory = catchAsyncError(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return next(new ErrorHandler("Category not found", 404));
  res.status(200).json({ success: true, category });
});

// controllers/categoryController.js
export const deleteCategory = catchAsyncError(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorHandler("Category not found", 404));

  // 🔥 Delete all products linked to this category
  await Product.deleteMany({ category: req.params.id });

  // Delete the category itself
  await category.deleteOne();

  res.status(200).json({ success: true, message: "Category and related products deleted successfully" });
});

