import express from "express";
import {
  changePassword,
  deleteMyProfile,
  deleteUser,
  forgetPassword,
  getAllUsers,
  getMyProfile,
  login,
  logout,
  refreshToken,   // ✅ new controller for refresh
  register,
  resetPassword,
  updateProfile,
  updateUserRole
} from "../controllers/userController.js";

import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// ✅ Authenticated user routes
router.route("/me")
  .get(isAuthenticated, getMyProfile)
  .delete(isAuthenticated, deleteMyProfile);

router.route("/changepassword").put(isAuthenticated, changePassword);
router.route("/updateprofile").put(isAuthenticated, updateProfile);

// ✅ Auth routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);

// ✅ New refresh token route
router.route("/refresh").post(refreshToken);

// ✅ Password reset
router.route("/forgetpassword").post(forgetPassword);
router.route("/resetpassword/:token").put(resetPassword);

// ✅ Admin-only routes
router.route("/admin/users")
  .get(isAuthenticated, authorizedAdmin, getAllUsers);

router.route("/admin/user/:id")
  .put(isAuthenticated, authorizedAdmin, updateUserRole)
  .delete(isAuthenticated, authorizedAdmin, deleteUser);

export default router;
