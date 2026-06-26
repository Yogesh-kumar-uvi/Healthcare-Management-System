import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // ✅ NEW
import { doctorRegistration } from "./doctorController.js";
import doctorModel from "../models/doctorModel.js";
import { sendEmail } from "../utils/sendEmail.js";

const registerController = asyncHandler(async (req, res) => {
  const { name, password, email, phone } = req.body;
  if (!name || !password || !email || !phone) {
    return res
      .status(400)
      .json({ message: "Provide complete data", success: false });
  }
  if (phone.length !== 10)
    return res.status(400).json({
      message: "Phone number should be of 10 numbers",
      success: false,
    });
  const registeredUser = await userModel.findOne({
    $or: [{ email: email }, { phone: phone }],
  });
  if (registeredUser) {
    return res.status(400).json({
      message: `User is already registered with email ${email}`,
      success: false,
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = new userModel({
    name,
    email,
    phone,
    password: hashedPassword,
  });
  const result = await user.save();
  if (result) {
    sendEmail(
      email,
      "Welcome to MediCare HMS 🎉",
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0f6e56;">Welcome, ${name}! 👋</h2>
        <p>Your account has been successfully created on <b>MediCare Healthcare Management System</b>.</p>
        <p>You can now:</p>
        <ul style="color:#2c2c2a;">
          <li>Book appointments with specialist doctors</li>
          <li>Chat directly with your doctor</li>
          <li>Track your appointment history</li>
          <li>Make secure online payments</li>
        </ul>
        <p style="margin-top:20px;color:#5f5e5a;font-size:13px;">— MediCare HMS Team</p>
      </div>`
    );

    return res.status(200).json({
      message: `User is registered successfully.`,
      data: result,
      success: true,
    });
  }
});

const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Provide complete data", success: false });
  }
  const user = await userModel.findOne({ email: email });
  if (!user) {
    return res.status(400).json({ message: "user not found.", success: false });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res
      .status(400)
      .json({ message: "Invalid Email and password", success: false });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  // ✅ NEW — token ab httpOnly cookie me jaata hai, JS (frontend) usse access nahi kar sakta — XSS-safe
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // production (HTTPS) me true, local dev me false
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 din, jwt expiry ke barabar
  });

  return res
    .status(200)
    .json({ message: "Login Success", success: true, name: user.name });
});

// ✅ NEW — logout: cookie clear karna
const logoutController = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.status(200).json({ message: "Logged out successfully", success: true });
});

const authController = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.body.userID);
  if (!user) {
    return res.status(404).json({
      message: "User not found.",
      success: false,
    });
  } else {
    return res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        id: user.id,
        phone: user.phone,           // ✅ NEW — phone bhi bhejo
        profilePhoto: user.profilePhoto, // ✅ NEW — profile photo bhi bhejo
      },
    });
  }
});

// ✅ FIX: params se body mein userID liya, kyunki route body se data bhejta hai (route: PUT /updateUserProfile, no :userID in URL)
const userProfileUpdateController = asyncHandler(async (req, res) => {
  const { userID, name, email, phone } = req.body;
  if (!userID)
    return res
      .status(400)
      .json({ message: "Provide complete data", success: false });

  const user = await userModel.findById(userID);
  if (!user)
    return res.status(400).json({ message: "No user found", success: false });

  const updatedName = name || user.name;
  const updatedEmail = email || user.email;
  const updatedPhone = phone || user.phone;

  const result = await userModel.findByIdAndUpdate(
    user._id,
    {
      name: updatedName,
      email: updatedEmail,
      phone: updatedPhone,
    },
    { new: true }
  );
  if (result)
    return res.status(200).json({
      message: "Profile updated successfully",
      data: result, // ✅ profilePhoto bhi automatically result mein aayega (DB se direct)
      success: true,
    });
});

// ✅ NEW — Step 1: user apna email deta hai, hum ek reset-link email karte hain
const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Provide email", success: false });

  const user = await userModel.findOne({ email });

  // ✅ SECURITY — email exist kare ya na kare, hamesha same generic message bhejo.
  // Warna attacker "user not found" vs "link sent" ke difference se pata laga sakta hai
  // ki kaunse emails registered hain (email-enumeration attack).
  const genericResponse = {
    message: "If this email is registered, a password reset link has been sent.",
    success: true,
  };

  if (!user) return res.status(200).json(genericResponse);

  // raw token email me jaayega, DB me sirf uska HASH store hoga
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minute expiry
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${rawToken}`;

  await sendEmail(
    user.email,
    "Reset Your Password — MediCare HMS",
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#0f6e56;">Hello ${user.name},</h2>
      <p>We received a request to reset your password. This link is valid for the next 10 minutes only.</p>
      <p><a href="${resetUrl}" style="background:#0f6e56;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a></p>
      <p style="color:#5f5e5a;font-size:13px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
    </div>`
  );

  return res.status(200).json(genericResponse);
});

// ✅ NEW — Step 2: user link se aaya hua token + naya password bhejta hai
const resetPasswordController = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: "Provide a new password", success: false });

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await userModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }, // expire time abhi se aage hona chahiye
  });

  if (!user) {
    return res.status(400).json({ message: "Reset link is invalid or has expired", success: false });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return res.status(200).json({ message: "Password reset successful. Please login.", success: true });
});

export {
  loginController,
  registerController,
  authController,
  userProfileUpdateController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
};