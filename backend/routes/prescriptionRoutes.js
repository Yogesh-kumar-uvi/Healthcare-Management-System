import express from "express";
import {
  createPrescription,
  getPrescriptionsByPatient,
  getPrescriptionsByDoctor,
} from "../controllers/prescriptionController.js";

const router = express.Router();

router.post("/", createPrescription);
router.get("/patient/:userID", getPrescriptionsByPatient);
router.get("/doctor/:doctorID", getPrescriptionsByDoctor);

export default router;