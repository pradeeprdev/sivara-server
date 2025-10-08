import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Basic fields
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },

    // Detailed Address fields
    flatBuilding: { type: String, required: true },   // Flat, House No., Building
    areaStreet: { type: String, required: true },     // Area, Street, Sector, Village
    landmark: { type: String },                       // Landmark
    townCity: { type: String, required: true },       // Town / City
    state: { type: String, required: true },          // State
    country: { type: String, required: true },        // Country/Region
    pincode: { type: String, required: true },        // PIN code

    // Extra fields
    isDefault: { type: Boolean, default: false },     // Make this my default address
    deliveryInstruction: { type: String },            // Delivery Instruction

    addressType: {
      type: String,
      enum: ["home", "apartment", "business", "other"],
      default: "home"
    },

    weekendDelivery: {
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: true }
    },

    additionalInstruction: { type: String },          // Extra instructions if needed
  },
  { timestamps: true }
);

export const Address = mongoose.model("Address", addressSchema);
