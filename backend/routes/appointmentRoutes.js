import express from "express";
import {
  createAppointment,
  getAppointmentDetails,
  deleteAppointment,
  updateAppointment,
  createRazorpayOrder,
  verifySignature,
  checkStatus,
  getPaymentList,
} from "../controllers/appointmentController.js";
import { offlineDoctor } from "../controllers/doctorController.js";

const router = express.Router();

router.post("/", createAppointment);
router.get("/", getAppointmentDetails);
router.delete("/", deleteAppointment);
router.put("/", updateAppointment);
router.post("/create-order", createRazorpayOrder);
router.post("/verify-order", verifySignature);
router.post("/check-status", checkStatus);
router.get("/get-payment-list/:doctorId", getPaymentList);
router.put("/offline-doctor/:doctorId", offlineDoctor);

export default router;
