import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { config } from "dotenv";
import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";

config({ path: "./.env" });

// 🔹 Register User
export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password, addresses, phone } = req.body;

  // ✅ Check required fields
  if (!name || !email || !password || !addresses) {
    return next(new ErrorHandler("Please enter all required fields", 400));
  }

  // ✅ Strong password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return next(
      new ErrorHandler(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
        400
      )
    );
  }

  const lowerPassword = password.toLowerCase();
  if (lowerPassword.includes(name.toLowerCase()) || lowerPassword.includes(email.split("@")[0].toLowerCase())) {
    return next(new ErrorHandler("Password should not contain your name or email", 400));
  }

  // ✅ Check if user exists
  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("User already exists", 409));

  // ✅ Create new user
  user = await User.create({ name, email, password, addresses, phone });

  // ✅ Send tokens
  sendToken(res, user, "Registered successfully", 201);
});

// 🔹 Login User
export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new ErrorHandler("Please enter all fields", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("User does not exist", 401));

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return next(new ErrorHandler("Incorrect email or password", 401));

  sendToken(res, user, `Welcome back, ${user.name}`, 200);
});

// 🔹 Logout User
export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "none" })
    .clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none" })
    .json({ success: true, message: "Logged out successfully" });
});

// 🔹 Get My Profile
export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

// 🔹 Update Profile
export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email, addresses, phone } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  if (name) user.name = name;
  if (email) user.email = email;
  if (addresses) user.addresses = addresses;
  if (phone) user.phone = phone;

  await user.save();
  res.status(200).json({ success: true, message: "Profile updated successfully" });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) 
    return next(new ErrorHandler("Please enter all fields", 400));

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) 
    return next(new ErrorHandler("Incorrect old password", 400));

  // ✅ Prevent same password
  if (oldPassword === newPassword) 
    return next(new ErrorHandler("New password cannot be the same as old password", 400));

  // Strong password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return next(new ErrorHandler(
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
      400
    ));
  }

  const lowerPassword = newPassword.toLowerCase();
  if (lowerPassword.includes(user.name.toLowerCase()) || lowerPassword.includes(user.email.split("@")[0].toLowerCase())) {
    return next(new ErrorHandler("Password should not contain your name or email", 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: "Password updated successfully" });
});

// 🔹 Forget Password
export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new ErrorHandler("Email is required", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found", 404));

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
  const message = `Click the link to reset your password: ${resetUrl}. If you did not request this, ignore it.`;

  try {
    await sendEmail(user.email, "Reset Password", message);
    res.status(200).json({
      success: true,
      message: `Reset token sent to ${user.email}`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Email could not be sent", 500));
  }
});

// 🔹 Reset Password
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) return next(new ErrorHandler("Password is required", 400));

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return next(new ErrorHandler("Token invalid or expired", 400));

  // ✅ Strong password validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    return next(
      new ErrorHandler(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
        400
      )
    );
  }

  const lowerPassword = password.toLowerCase();
  if (
    lowerPassword.includes(user.name.toLowerCase()) ||
    lowerPassword.includes(user.email.split("@")[0].toLowerCase())
  ) {
    return next(
      new ErrorHandler("Password should not contain your name or email", 400)
    );
  }

  // ✅ Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});



// 🔹 Get All Users (Admin)
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ success: true, users });
});

// 🔹 Update User Role (Admin)
export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  user.role = user.role === "user" ? "admin" : "user";
  await user.save();

  res.status(200).json({ success: true, message: "Role updated successfully" });
});

// 🔹 Delete User (Admin)
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  if (user.avatar && user.avatar.public_id) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  }

  await user.deleteOne();
  res.status(200).json({ success: true, message: "User deleted successfully" });
});

// 🔹 Delete My Profile
export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.avatar && user.avatar.public_id) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  }

  await user.deleteOne();

  res
    .status(200)
    .clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "none" })
    .clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none" })
    .json({ success: true, message: "Profile deleted successfully" });
});

// 🔹 Refresh Access Token
export const refreshToken = catchAsyncError(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return next(new ErrorHandler("Refresh token missing", 401));

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) return next(new ErrorHandler("User not found", 404));

    const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_SECRET, { expiresIn: "15m" });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ success: true, accessToken });
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired refresh token", 403));
  }
});
