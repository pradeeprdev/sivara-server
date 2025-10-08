import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} from "../controllers/productController.js";

import { isAuthenticated, authorizedAdmin } from "../middlewares/auth.js";

const router = express.Router();

//  Create product (admin only)
router.post("/products/:categoryId", isAuthenticated, authorizedAdmin, createProduct);

// Get all products (public)
router.get("/products", getAllProducts);

//  Get single product (public)
router.get("/products/:id", getProductById);

// Update product (admin only)
router.put("/products/:id", isAuthenticated, authorizedAdmin, updateProduct);

// Delete product (admin only)
router.delete("/products/:id", isAuthenticated, authorizedAdmin, deleteProduct);

// Get all products for a category (public)
router.get("/category/:categoryId/products", getProductsByCategory);

export default router;
