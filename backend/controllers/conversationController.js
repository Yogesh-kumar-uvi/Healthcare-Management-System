import conversationModel from "../models/conversationModel.js";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js"; // ✅ NEW import
import asyncHandler from "express-async-handler";

const userSendMessage = asyncHandler(async (req, res) => {
  const { userID, doctorID, message } = req.body;
  if (!userID || !doctorID || !message)
    return res.status(400).json({ message: "Provide complete data", success: false });

  const user = await userModel.findById(userID);
  if (!user)
    return res.status(400).json({ message: "No user found", success: false });

  const doctor = await doctorModel.findById(doctorID);
  if (!doctor)
    return res.status(400).json({ message: "No doctor found", success: false });

  // ✅ FIX: Appointment exist karta hai ya nahi check karo
  const appointmentExists = await appointmentModel.findOne({
    user: userID,
    doctor: doctorID,
  });
  if (!appointmentExists)
    return res.status(403).json({
      message: "No appointment found. You cannot chat without booking an appointment.",
      success: false,
    });

  // User active hai — lastSeen update karo
  await userModel.findByIdAndUpdate(userID, { lastSeen: new Date() });

  const newMessage = new conversationModel({
    user: userID,
    doctor: doctorID,
    messages: {
      sender: "user",
      message: message,
    },
  });

  const result = await newMessage.save();
  if (result)
    return res.status(200).json({
      message: "Message sent successfully",
      data: result,
      success: true,
    });
});

const doctorSendMessage = asyncHandler(async (req, res) => {
  const { userID, doctorID, message } = req.body;
  if (!userID || !doctorID || !message)
    return res.status(400).json({ message: "Provide complete data", success: false });

  const user = await userModel.findById(userID);
  if (!user)
    return res.status(400).json({ message: "No user found", success: false });

  const doctor = await doctorModel.findById(doctorID);
  if (!doctor)
    return res.status(400).json({ message: "No doctor found", success: false });

  // ✅ FIX: Appointment exist karta hai ya nahi check karo
  const appointmentExists = await appointmentModel.findOne({
    user: userID,
    doctor: doctorID,
  });
  if (!appointmentExists)
    return res.status(403).json({
      message: "No appointment found. You cannot chat without an appointment.",
      success: false,
    });

  // Doctor active hai — online true karo
  await doctorModel.findByIdAndUpdate(doctorID, { online: true });

  const newMessage = new conversationModel({
    user: userID,
    doctor: doctorID,
    messages: {
      sender: "doctor",
      message: message,
    },
  });

  const result = await newMessage.save();
  if (result)
    return res.status(200).json({
      message: "Message sent successfully",
      data: result,
      success: true,
    });
});

const getMessages = asyncHandler(async (req, res) => {
  const { userID, doctorID } = req.query;
  if (!userID || !doctorID)
    return res.status(400).json({ message: "Provide complete data", success: false });

  const user = await userModel.findById(userID);
  if (!user)
    return res.status(400).json({ message: "No user found", success: false });

  const doctor = await doctorModel.findById(doctorID);
  if (!doctor)
    return res.status(400).json({ message: "No doctor found", success: false });

  // ✅ FIX: Sabse pehle appointment check karo
  const appointmentExists = await appointmentModel.findOne({
    user: userID,
    doctor: doctorID,
  });

  // ✅ FIX: Agar appointment nahi hai to seedha false, false return karo — koi online status nahi dikhega
  if (!appointmentExists) {
    return res.status(200).json({
      message: "No appointment found between this user and doctor",
      data: [],
      doctorOnline: false,
      userOnline: false,
      success: true,
    });
  }

  // User ne fetch kiya = wo active hai, lastSeen update karo
  await userModel.findByIdAndUpdate(userID, { lastSeen: new Date() });

  const messages = await conversationModel
    .find({ user: userID, doctor: doctorID })
    .sort({ createdAt: 1 });

  // 15 seconds ke andar lastSeen = user online hai
  const fifteenSecondsAgo = new Date(Date.now() - 15000);
  const isUserOnline = user.lastSeen && user.lastSeen > fifteenSecondsAgo;

  return res.status(200).json({
    message: messages.length === 0 ? "No messages found" : "Messages fetched successfully",
    data: messages || [],
    doctorOnline: !!doctor.online,   // ✅ ab sirf appointment hone par hi true ho sakta hai
    userOnline: !!isUserOnline,      // ✅ ab sirf appointment hone par hi true ho sakta hai
    success: true,
  });
});

export { userSendMessage, doctorSendMessage, getMessages };