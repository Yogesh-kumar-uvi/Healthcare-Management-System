import slotModel from "../models/slotModel.js";
import doctorModel from "../models/doctorModel.js";
import asyncHandler from "express-async-handler";

// ✅ NEW — Doctor apna availability ek date ke liye generate karta hai.
// Frontend se aana hai: { date: "2026-06-30", startTime: "10:00", endTime: "13:00", slotDuration: 30 }
// doctorID isDoctor middleware se aata hai (req.body.doctorID) — client se trust nahi karte,
// taaki koi doctor doosre doctor ke naam pe slot na bana sake.
const generateSlots = asyncHandler(async (req, res) => {
  const { doctorID, date, startTime, endTime, slotDuration } = req.body;

  if (!doctorID || !date || !startTime || !endTime || !slotDuration) {
    return res.status(400).json({ message: "Provide complete data", success: false });
  }

  const doctor = await doctorModel.findById(doctorID);
  if (!doctor) {
    return res.status(400).json({ message: "No such doctor found.", success: false });
  }

  // HH:mm ko total minutes me convert karke loop chalate hain
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  let cursor = startH * 60 + startM;
  const endTotalMin = endH * 60 + endM;
  const duration = Number(slotDuration);

  if (Number.isNaN(cursor) || Number.isNaN(endTotalMin) || Number.isNaN(duration) || duration <= 0) {
    return res.status(400).json({ message: "Invalid time/duration format", success: false });
  }

  const slotsToCreate = [];
  while (cursor + duration <= endTotalMin) {
    const h = String(Math.floor(cursor / 60)).padStart(2, "0");
    const m = String(cursor % 60).padStart(2, "0");
    slotsToCreate.push({ doctor: doctorID, date, time: `${h}:${m}` });
    cursor += duration;
  }

  // ✅ duplicate slot (same doctor+date+time) ko schema ka unique index reject kar dega (error code 11000) — usse ignore karo
  let createdCount = 0;
  for (const slot of slotsToCreate) {
    try {
      await slotModel.create(slot);
      createdCount++;
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
  }

  return res.status(200).json({
    message: `${createdCount} new slot(s) created (already-existing slots skipped)`,
    success: true,
  });
});

// ✅ NEW — Patient ko sirf available (isBooked:false) slots dikhne chahiye
// GET /slot/api/v1/available?doctorId=...&date=YYYY-MM-DD
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) {
    return res.status(400).json({ message: "Provide doctorId and date", success: false });
  }

  const slots = await slotModel
    .find({ doctor: doctorId, date, isBooked: false })
    .sort({ time: 1 });

  return res.status(200).json({ message: "Available slots fetched", data: slots, success: true });
});

// ✅ NEW — Doctor apna ek future, abhi-tak-unbooked slot delete kar sake (e.g. leave lene par)
const deleteSlot = asyncHandler(async (req, res) => {
  const { slotId } = req.params;
  const slot = await slotModel.findById(slotId);
  if (!slot) return res.status(400).json({ message: "Slot not found", success: false });
  if (slot.isBooked) {
    return res.status(400).json({ message: "Cannot delete a slot that's already booked", success: false });
  }
  await slotModel.findByIdAndDelete(slotId);
  return res.status(200).json({ message: "Slot deleted successfully", success: true });
});

// ✅ NEW — doctor apne saare slots (ek date ke liye) dekh sake, booked + available dono
const getDoctorSlots = asyncHandler(async (req, res) => {
  const { doctorID, date } = req.body; // isDoctor middleware se doctorID
  if (!doctorID || !date) {
    return res.status(400).json({ message: "Provide date", success: false });
  }
  const slots = await slotModel.find({ doctor: doctorID, date }).sort({ time: 1 });
  return res.status(200).json({ message: "Slots fetched", data: slots, success: true });
});

export { generateSlots, getAvailableSlots, deleteSlot, getDoctorSlots };