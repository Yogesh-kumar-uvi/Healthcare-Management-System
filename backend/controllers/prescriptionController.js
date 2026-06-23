import prescriptionModel from "../models/prescriptionModel.js";
import asyncHandler from "express-async-handler";

const createPrescription = asyncHandler(async (req, res) => {
  const { userID, doctorID, diagnosis, medicines, notes } = req.body;

  if (!userID || !doctorID || !medicines || medicines.length === 0)
    return res.status(400).json({ message: "Provide complete data", success: false });

  const prescription = new prescriptionModel({
    user: userID,
    doctor: doctorID,
    diagnosis,
    medicines,
    notes,
  });

  const result = await prescription.save();
  if (result)
    return res.status(200).json({
      message: "Prescription created successfully",
      data: result,
      success: true,
    });
});

const getPrescriptionsByPatient = asyncHandler(async (req, res) => {
  const userID = req.params.userID;
  if (!userID)
    return res.status(400).json({ message: "Provide complete data", success: false });

  const prescriptions = await prescriptionModel
    .find({ user: userID })
    .populate([{ path: "doctor", select: "name specialization" }])
    .sort({ createdAt: -1 });

  return res.status(200).json({
    message: "Prescriptions fetched successfully",
    data: prescriptions,
    success: true,
  });
});

const getPrescriptionsByDoctor = asyncHandler(async (req, res) => {
  const doctorID = req.params.doctorID;
  if (!doctorID)
    return res.status(400).json({ message: "Provide complete data", success: false });

  const prescriptions = await prescriptionModel
    .find({ doctor: doctorID })
    .populate([{ path: "user", select: "name phone email" }])
    .sort({ createdAt: -1 });

  return res.status(200).json({
    message: "Prescriptions fetched successfully",
    data: prescriptions,
    success: true,
  });
});

export { createPrescription, getPrescriptionsByPatient, getPrescriptionsByDoctor };