import express from "express";
import {
  doctorLogin,
  doctorRegistration,
  getAllDoctors,
  getDoctor,
  updateDoctorProfile,
  offlineDoctor,
} from "../controllers/doctorController.js";
import {
  appointmentApproval,
  appointmentCancel,
  appointmentComplete,
  getAppointmentByDoctor,
} from "../controllers/appointmentController.js";
import { isDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllDoctors);
router.post("/getDoctor", isDoctor, getDoctor);
router.post("/registration", doctorRegistration);
router.post("/login", doctorLogin);
router.put("/", updateDoctorProfile);
router.get("/doctorAppointments/:doctorID", getAppointmentByDoctor);
router.put("/approval", appointmentApproval);
router.put("/cancel", appointmentCancel);
router.put("/complete", appointmentComplete);
router.put("/offline-doctor/:doctorId", offlineDoctor);

export default router;