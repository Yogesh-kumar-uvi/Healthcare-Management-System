import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";
import asyncHandler from "express-async-handler";
import notificationModel from "../models/notificationModel.js";
import razorpay from "../config/razorpayConfig.js";
import Payment from "../models/paymentModel.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

const createAppointment = asyncHandler(async (req, res) => {
  const { userID, doctorID, timing } = req.body;
  if (!userID || !doctorID || !timing)
    return res.status(400).json({ message: "Provide complete data", success: false });
  const user = await userModel.findById(userID);
  if (!user) return res.status(400).json({ message: "No such user found.", success: false });
  const doctor = await doctorModel.findById(doctorID);
  if (!doctor) return res.status(400).json({ message: "No such doctor found.", success: false });
  const appointment = new appointmentModel({ user: userID, doctor: doctorID, day: timing });
  const result = await appointment.save();
  if (result) {
    sendEmail(
      user.email,
      "Appointment Request Received — MediCare HMS",
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0f6e56;">Hello ${user.name},</h2>
        <p>Your appointment request has been received successfully.</p>
        <table style="width:100%;margin:16px 0;font-size:14px;">
          <tr><td style="padding:6px 0;color:#5f5e5a;">Doctor</td><td style="font-weight:600;">Dr. ${doctor.name}</td></tr>
          <tr><td style="padding:6px 0;color:#5f5e5a;">Specialization</td><td>${doctor.specialization}</td></tr>
          <tr><td style="padding:6px 0;color:#5f5e5a;">Timing</td><td>${timing}</td></tr>
          <tr><td style="padding:6px 0;color:#5f5e5a;">Status</td><td style="color:#854f0b;font-weight:600;">Pending Confirmation</td></tr>
        </table>
        <p>You will be notified once the doctor confirms your appointment.</p>
        <p style="margin-top:20px;color:#5f5e5a;font-size:13px;">— MediCare HMS Team</p>
      </div>`
    );

    return res.status(200).json({ message: "Appointment saved successfully", data: result, success: true });
  }
});

const getAppointmentDetails = asyncHandler(async (req, res) => {
  const { appointmentID } = req.body;
  if (!appointmentID)
    return res.status(400).json({ message: "Provide complete data", success: false });
  const appointment = await appointmentModel.findById(appointmentID).populate([
    { path: "user", select: "name" },
    { path: "doctor", select: "name phone specialization fees" },
  ]);
  if (!appointment)
    return res.status(400).json({ message: "No such appointment found", success: false });
  return res.status(200).json({ message: "Appointment details sent successfully", data: appointment, success: true });
});

const deleteAppointment = asyncHandler(async (req, res) => {
  const { appointmentID } = req.body;
  if (!appointmentID)
    return res.status(400).json({ message: "Provide complete data", success: false });
  const appointment = await appointmentModel.findById(appointmentID);
  if (!appointment)
    return res.status(400).json({ message: "No appointment found", success: false });
  const resp = await appointmentModel.findByIdAndDelete(appointmentID);
  if (resp)
    return res.status(200).json({ message: "Appointment deleted successfully", success: true });
});

const updateAppointment = asyncHandler(async (req, res) => {
  const { appointmentID, timing } = req.body;
  if (!appointmentID || !timing)
    return res.status(400).json({ message: "Provide complete data", success: false });
  const appointment = await appointmentModel.findById(appointmentID);
  if (!appointment)
    return res.status(400).json({ message: "No appointment found", success: false });
  const result = await appointmentModel.findByIdAndUpdate(
    appointmentID, { day: timing, status: "Pending" }, { new: true }
  );
  if (result) {
    const notification = new notificationModel({
      user: appointment.user, appointment: appointmentID,
      message: "Your one of the appointment is Updated.",
    });
    await notification.save();
    return res.status(200).json({ message: "Appointment updated successfully", success: true });
  }
});

const getAppointmentByDoctor = asyncHandler(async (req, res) => {
  const doctorID = req.params.doctorID;
  if (!doctorID)
    return res.status(400).json({ message: "Provide complete data", success: false });
  const appointments = await appointmentModel
    .find({ doctor: doctorID })
    .populate([{ path: "user", select: "name phone email" }]);
  if (appointments.length === 0)
    return res.status(400).json({ message: "No appointment found", success: false });
  return res.status(200).json({ message: "Appointments sent successfully", data: appointments, success: true });
});

const getAppointmentByUser = asyncHandler(async (req, res) => {
  const userID = req.params.userID;
  if (!userID)
    return res.status(400).json({ message: "Provide complete data", success: false });
  const appointments = await appointmentModel.find({ user: userID }).populate([
    { path: "doctor", select: "name phone specialization experience fees availableTimings.day1 availableTimings.day2 availableTimings.time1 availableTimings.time2" },
  ]);
  // ✅ FIX — null doctor wale appointments hata do
  const validAppointments = appointments.filter((a) => a.doctor !== null);
  if (validAppointments.length === 0)
    return res.status(200).json({ message: "No appointment found", success: false });
  return res.status(200).json({ message: "Appointments sent successfully", data: validAppointments, success: true });
});

const appointmentApproval = asyncHandler(async (req, res) => {
  const { doctorID, appointmentID } = req.body;
  if (!doctorID || !appointmentID)
    return res.status(400).json({ message: "Provide complete data", success: false });
  const appointment = await appointmentModel.findById(appointmentID).populate([
    { path: "user", select: "name email" },
    { path: "doctor", select: "name specialization" },
  ]);
  if (appointment.doctor._id != doctorID)
    return res.status(400).json({ message: "Not allowed", success: false });
  const result = await appointmentModel.findByIdAndUpdate(
    appointmentID, { status: "Confirmed" }, { new: true }
  );
  if (result) {
    const notification = new notificationModel({
      user: appointment.user._id, appointment: appointmentID,
      message: "Your one of the appointment is Confirmed.",
    });
    await notification.save();

    sendEmail(
      appointment.user.email,
      "Appointment Confirmed ✅ — MediCare HMS",
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0f6e56;">Hello ${appointment.user.name},</h2>
        <p>Great news! Your appointment with <b>Dr. ${appointment.doctor.name}</b> (${appointment.doctor.specialization}) has been <span style="color:#3b6d11;font-weight:600;">Confirmed</span>.</p>
        <p>Please be available at the scheduled time. You can chat with the doctor anytime from your dashboard.</p>
        <p style="margin-top:20px;color:#5f5e5a;font-size:13px;">— MediCare HMS Team</p>
      </div>`
    );

    return res.status(200).json({ message: "Appointment approved successfully", data: result, success: true });
  }
});

const appointmentCancel = asyncHandler(async (req, res) => {
  const { doctorID, appointmentID } = req.body;
  if (!doctorID || !appointmentID)
    return res.status(400).json({ message: "Provide complete data", success: false });
  const appointment = await appointmentModel.findById(appointmentID).populate([
    { path: "user", select: "name email" },
    { path: "doctor", select: "name specialization" },
  ]);
  if (appointment.doctor._id != doctorID)
    return res.status(400).json({ message: "Not allowed", success: false });
  const result = await appointmentModel.findByIdAndUpdate(
    appointmentID, { status: "Cancelled" }, { new: true }
  );
  if (result) {
    const notification = new notificationModel({
      user: appointment.user._id, appointment: appointmentID,
      message: "Your one of the appointment is cancelled.",
    });
    await notification.save();

    sendEmail(
      appointment.user.email,
      "Appointment Cancelled — MediCare HMS",
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#a32d2d;">Hello ${appointment.user.name},</h2>
        <p>We're sorry to inform you that your appointment with <b>Dr. ${appointment.doctor.name}</b> (${appointment.doctor.specialization}) has been <span style="color:#a32d2d;font-weight:600;">Cancelled</span>.</p>
        <p>You can book a new appointment anytime from your dashboard.</p>
        <p style="margin-top:20px;color:#5f5e5a;font-size:13px;">— MediCare HMS Team</p>
      </div>`
    );

    return res.status(200).json({ message: "Appointment cancelled successfully", data: result, success: true });
  }
});

const appointmentComplete = asyncHandler(async (req, res) => {
  const { doctorID, appointmentID } = req.body;
  if (!doctorID || !appointmentID)
    return res.status(400).json({ message: "Provide complete data", success: false });
  const appointment = await appointmentModel.findById(appointmentID);
  if (appointment.doctor != doctorID)
    return res.status(400).json({ message: "Not allowed", success: false });
  const result = await appointmentModel.findByIdAndUpdate(
    appointmentID, { status: "Completed" }, { new: true }
  );
  if (result) {
    const notification = new notificationModel({
      user: appointment.user, appointment: appointmentID,
      message: "Your one of the appointment is completed.",
    });
    await notification.save();
    return res.status(200).json({ message: "Appointment completed successfully", data: result, success: true });
  }
});

const getUniqueAppointmentByUser = asyncHandler(async (req, res) => {
  const userID = req.params.userID;
  if (!userID)
    return res.status(400).json({ message: "Provide complete data", success: false });
  const appointments = await appointmentModel.find({ user: userID }).populate([
    { path: "doctor", select: "name phone specialization experience fees availableTimings.day1 availableTimings.day2 availableTimings.time1 availableTimings.time2" },
  ]);

  // ✅ FIX — null doctor wale appointments hata do (ye hi crash ki wajah thi)
  const validAppointments = appointments.filter((a) => a.doctor !== null);

  const uniqueDoctorIDs = [...new Set(validAppointments.map((a) => String(a.doctor._id)))];
  const uniqueAppointments = validAppointments.filter((a) => uniqueDoctorIDs.includes(String(a.doctor._id)));

  if (uniqueAppointments.length === 0)
    return res.status(200).json({ message: "No appointment found", success: false });
  return res.status(200).json({ message: "Appointments sent successfully", data: uniqueAppointments, success: true });
});

const createRazorpayOrder = async (req, res) => {
  try {
    const { userId, doctorId, amount } = req.body;
    if (!userId || !doctorId || !amount)
      return res.status(400).json({ message: "Provide all required fields.", success: false });

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
    };

    const order = await razorpay.orders.create(options);

    if (order.status !== "created")
      return res.status(400).json({ message: "Order could not be created", success: false });

    const orderData = {
      id: order.id,
      amount: order.amount,
      currency: "INR",
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    };

    const createdOrder = new Payment({
      userId,
      doctorId,
      paymentDate: Date.now(),
      totalAmount: amount,
      razorpayOrderId: order.id,
    });

    const result = await createdOrder.save();
    if (!result)
      return res.status(400).json({ message: "Order could not be saved", success: false });

    return res.status(200).json({ data: orderData, success: true });

  } catch (error) {
    console.error("Razorpay Error:", error);
    return res.status(500).json({ message: error.message || "Payment failed", success: false });
  }
};

const verifySignature = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");
    if (generatedSignature === razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { paymentStatus: "Fully Paid", razorpaySignature: razorpay_signature, razorpayPaymentId: razorpay_payment_id, paymentDate: Date.now() },
        { new: true }
      );
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ success: false });
  } catch (error) {
    console.error("Verify Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const checkStatus = async (req, res) => {
  try {
    const { orderID } = req.body;
    if (!orderID)
      return res.status(400).json({ message: "Provide order ID.", success: false });
    const order = await Payment.findOne({ razorpayOrderId: orderID });
    if (order.paymentStatus === "Fully Paid")
      return res.status(200).json({ message: "Order is paid", success: true });
    return res.status(400).json({ message: "Order Payment is pending.", success: false });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getPaymentList = asyncHandler(async (req, res) => {
  const doctorId = req.params.doctorId;
  if (!doctorId) return res.status(400).json({ message: "Provide Doctor ID" });
  const paymentList = await Payment.find({ doctorId: doctorId })
    .select("userId doctorId totalAmount paymentStatus paymentDate updatedAt")
    .populate([{ path: "userId", select: "name phone" }]);
  if (paymentList.length === 0)
    return res.status(200).json({ message: "No Payments found" });
  return res.status(200).json({ message: "Payment List Sent", data: paymentList });
});

export {
  createAppointment, getAppointmentDetails, deleteAppointment, updateAppointment,
  getAppointmentByDoctor, appointmentApproval, appointmentCancel, appointmentComplete,
  getAppointmentByUser, getUniqueAppointmentByUser, createRazorpayOrder,
  checkStatus, verifySignature, getPaymentList,
};