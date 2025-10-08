import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { config } from "dotenv";
import {Address} from "./Addresses.js";
import Category from "./Categories.js";
import Product from "./Products.js";

config({ path: "./.env" });

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  phone: {
    type: String,
    validate: {
      validator: function (value) {
        return validator.isMobilePhone(value, "any");
      },
      message: "Please enter a valid phone number",
    },
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
    validate: {
      validator: function (value) {
        // Strong password regex
        const strongPasswordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!strongPasswordRegex.test(value)) {
          return false;
        }

        //  Prevent password containing name or email prefix
        const lowerPassword = value.toLowerCase();
        if (this.name && lowerPassword.includes(this.name.toLowerCase())) {
          return false;
        }
        if (
          this.email &&
          lowerPassword.includes(this.email.split("@")[0].toLowerCase())
        ) {
          return false;
        }

        return true;
      },
      message:
        "Password must be strong (min 8 chars, uppercase, lowercase, number, special char) and must not include your name or email.",
    },
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  addresses: {
    type: String,
    ref: "Addresses",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// 🔹 Hash password before saving
schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
schema.pre("deleteOne", { document: true, query: false }, async function (next) {
  const userId = this._id;
  console.log(`🧹 Cleaning up data for deleted user: ${userId}`);

  await Address.deleteMany({ user: userId });
  await Category.deleteMany({ user: userId });
  await Product.deleteMany({ user: userId });

  next();
});


// 🔹 JWT Access Token
schema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_KEY, {
    expiresIn: "15m", // ⬅️ better security (short-lived)
  });
};

// 🔹 Compare password
schema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔹 Generate Reset Token
schema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min expiry

  return resetToken;
};

export const User = mongoose.model("User", schema);
