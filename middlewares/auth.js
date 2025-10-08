import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "./catchAsyncError.js";
import { User } from "../models/User.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  // Look for accessToken in Authorization header OR cookie
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.startsWith("Bearer")
    ? authHeader.split(" ")[1]
    : req.cookies.accessToken;

  if (!token) return next(new ErrorHandler("Not Logged In", 401));

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return next(new ErrorHandler("User not found", 404));
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token expired", 401));
    }
    return next(new ErrorHandler("Invalid token", 403));
  }
});


//  Middleware: Verify Admin Role
export const authorizedAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(
      new ErrorHandler(
        `${req.user.role} is not allowed to access this resource`,
        403
      )
    );
  }
  next();
};
