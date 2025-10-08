import jwt from "jsonwebtoken";

export const sendToken = (res, user, message, statusCode = 200) => {
  // Create short-lived access token
  const accessToken = jwt.sign(
    { id: user._id },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  // Create long-lived refresh token
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // Cookie options
  const cookieOptions = (expiresIn) => ({
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: expiresIn,
  });

  // Send both cookies
  res
    .status(statusCode)
    .cookie("accessToken", accessToken, cookieOptions(15 * 60 * 1000)) // 15 min
    .cookie("refreshToken", refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000)) // 7 days
    .json({
      success: true,
      message,
      user,
      accessToken,
      refreshToken,
    });
};
