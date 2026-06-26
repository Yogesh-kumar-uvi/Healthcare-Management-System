import express from "express";
import {
  generateSlots,
  getAvailableSlots,
  deleteSlot,
  getDoctorSlots,
} from "../controllers/slotController.js";
import { isDoctor } from "../middleware/authMiddleware.js";
import { generateSlotsValidation } from "../middleware/validators.js"; // ✅ NEW

const router = express.Router();

// doctor-only actions — sirf logged-in doctor apne slots manage kar sake
router.post("/generate", isDoctor, generateSlotsValidation, generateSlots); // ✅ UPDATED
router.post("/my-slots", isDoctor, getDoctorSlots);
router.delete("/:slotId", isDoctor, deleteSlot);

// public — patient ko doctor select karne ke baad available slots dikhane ke liye
router.get("/available", getAvailableSlots);

export default router;