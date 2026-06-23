import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
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
  return res
    .status(200)
    .json({ message: "Login Success", success: true, token, name: user.name });
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

export {
  loginController,
  registerController,
  authController,
  userProfileUpdateController,
};