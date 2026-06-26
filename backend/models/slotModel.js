import mongoose from "mongoose";

// ✅ NEW — Slot model
// Har document ek "bookable" time-slot hai — doctor isse generate karta hai,
// patient isme se choose karta hai. isBooked flag double-booking rokta hai.
const slotSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
    },
    date: {
      type: String, // "YYYY-MM-DD" — string rakha hai taaki query/sort simple rahe
      required: true,
    },
    time: {
      type: String, // 24-hour format "HH:mm", e.g. "10:30"
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointments",
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ ek doctor ke ek date pe ek hi time ka slot duplicate na ban paaye
slotSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true });

const slotModel = mongoose.model("slots", slotSchema);
export default slotModel;