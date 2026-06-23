import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
    },
    diagnosis: {
      type: String,
      default: "",
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
      },
    ],
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const prescriptionModel = mongoose.model("prescriptions", prescriptionSchema);

export default prescriptionModel;