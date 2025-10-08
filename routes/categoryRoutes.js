// routes/categoryRoutes.js
import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryWithProducts,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";
import { authorizeAdmin } from "../middlewares/admin.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

//  Create Category (requires login)
router.post("/category", isAuthenticated, authorizeAdmin,createCategory);

// Get all categories (public)
router.get("/category", getCategories);

//  Get single category with products (requires login)
router.get("/category/:id", isAuthenticated, getCategoryWithProducts);

//  Update category (admin only)
router.put("/category/:id", isAuthenticated,authorizeAdmin, updateCategory);

//  Delete category (admin only)
router.delete("/category/:id", isAuthenticated,authorizeAdmin, deleteCategory);

export default router;
