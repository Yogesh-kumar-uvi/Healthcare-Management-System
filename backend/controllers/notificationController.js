import notificationModel from "../models/notificationModel.js";
import asyncHandler from "express-async-handler";

const getNotification = asyncHandler(async (req, res) => {
  const { notificationID } = req.body;
  if (!notificationID)
    return res
      .status(400)
      .json({ message: "Provide complete data", success: false });
  const notification = await notificationModel.findById(notificationID);
  if (!notification)
    return res
      .status(400)
      .json({ message: "No notification found", success: false });
  return res.status(200).json({
    message: "Notification sent successful",
    data: notification,
    success: true,
  });
});

const allNotification = asyncHandler(async (req, res) => {
  const userID = req.params.userID;
  if (!userID)
    return res
      .status(400)
      .json({ message: "Provide complete data", success: false });
  const notification = await notificationModel
    .find({ user: userID })
    .populate({
      path: "appointment",
      select: "doctor",
      populate: { path: "doctor", select: "name" },
    });
  if (notification.length == 0)
    return res
      .status(400)
      .json({ message: "No notification found", success: false });
  return res.status(200).json({
    message: "Notification sent successful",
    data: notification,
    success: true,
  });
});

const notificationSeen = asyncHandler(async (req, res) => {
  const { notificationID } = req.body;
  if (!notificationID)
    return res
      .status(400)
      .json({ message: "Provide complete data", success: false });
  const notification = await notificationModel.findById(notificationID);
  if (!notification)
    return res
      .status(400)
      .json({ message: "No notification found", success: false });
  const result = await notificationModel.findByIdAndUpdate(
    notificationID,
    {
      seen: true,
    },
    { new: true }
  );
  if (result)
    return res
      .status(200)
      .json({ message: "Notification seen", data: result, success: true });
});

export { getNotification, allNotification, notificationSeen };
