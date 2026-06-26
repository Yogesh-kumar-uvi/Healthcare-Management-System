import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      require: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      require: true,
    },
    day: {
      type: String,
      required: true,
    },
    // ✅ NEW — slot-based booking se aane wale appointments ke liye
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "slots",
      default: null,
    },
    // ✅ NEW — real Date object, isse "kal ka appointment kaun sa hai" jaisi queries possible hoti hain
    // (purana `day` field free-text hai jaise "Monday 10AM", uspe date-math nahi ho sakta)
    appointmentDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Confirmed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const appointmentModel = mongoose.model("appointments", appointmentSchema);

export default appointmentModel;