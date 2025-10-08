import ErrorHandler from "../utils/errorHandler.js";

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Access denied. Admins only.", 403));
  }
  next();
};
