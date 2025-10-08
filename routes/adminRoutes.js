import express from "express";
import { promoteToAdmin } from "../controllers/adminController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.put("/make-admin/:id", isAuthenticated, authorizeRoles("admin"), promoteToAdmin);

export default router;