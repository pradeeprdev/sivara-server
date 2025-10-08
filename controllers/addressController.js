import {Address} from "../models/Addresses.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";

//  Create Address
export const createAddress = catchAsyncError(async (req, res, next) => {
  const {
    fullName,
    mobileNumber,
    flatBuilding,
    areaStreet,
    landmark,
    townCity,
    state,
    country,
    pincode,
    isDefault,
    deliveryInstruction,
    addressType,
    weekendDelivery,
    additionalInstruction
  } = req.body;

  // Validation
  if (!fullName || !mobileNumber || !flatBuilding || !areaStreet || !townCity || !state || !country || !pincode) {
    return next(new ErrorHandler("All required fields must be filled", 400));
  }

  //  If user sets this as default, reset old default
  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const address = await Address.create({
    user: req.user._id,
    fullName,
    mobileNumber,
    flatBuilding,
    areaStreet,
    landmark,
    townCity,
    state,
    country,
    pincode,
    isDefault,
    deliveryInstruction,
    addressType,
    weekendDelivery,
    additionalInstruction
  });

  res.status(201).json({ success: true, address });
});

// Get My Addresses
export const getMyAddresses = catchAsyncError(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id });
  res.status(200).json({ success: true, addresses });
});

// Update Address
export const updateAddress = catchAsyncError(async (req, res, next) => {
  const { isDefault } = req.body;

  // If user makes this default, reset others
  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!address) return next(new ErrorHandler("Address not found", 404));

  res.status(200).json({ success: true, address });
});

//  Delete Address
export const deleteAddress = catchAsyncError(async (req, res, next) => {
  const address = await Address.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) return next(new ErrorHandler("Address not found", 404));

  res.status(200).json({ success: true, message: "Address deleted successfully" });
});
