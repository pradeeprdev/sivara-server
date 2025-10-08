import express from "express";
import {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress
} from "../controllers/addressController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Address Routes
router.post("/address", isAuthenticated, createAddress);
router.get("/address", isAuthenticated, getMyAddresses);
router.put("/address/:id", isAuthenticated, updateAddress);
router.delete("/address/:id", isAuthenticated, deleteAddress);

export default router;
