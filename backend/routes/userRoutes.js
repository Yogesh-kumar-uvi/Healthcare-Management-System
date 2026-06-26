import express from "express";
import {
  authController,
  loginController,
  registerController,
  userProfileUpdateController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/userController.js";
import { isUser } from "../middleware/authMiddleware.js";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../middleware/validators.js"; // ✅ NEW
import { getAllDoctors } from "../controllers/doctorController.js";
import {
  getAppointmentByUser,
  getUniqueAppointmentByUser,
} from "../controllers/appointmentController.js";

// router onject
const router = express.Router();

// routes

router.post("/login", loginValidation, loginController); // ✅ UPDATED
router.post("/register", registerValidation, registerController); // ✅ UPDATED
router.post("/getUserData", isUser, authController);
router.get("/getAllDoctors", getAllDoctors);
router.get("/getAllAppointments/:userID", getAppointmentByUser);
router.put("/updateUserProfile", isUser, userProfileUpdateController);
router.get("/getUniqueAppointments/:userID", getUniqueAppointmentByUser);
router.post("/logout", logoutController);
router.post("/forgot-password", forgotPasswordValidation, forgotPasswordController); // ✅ UPDATED
router.put("/reset-password/:token", resetPasswordValidation, resetPasswordController); // ✅ UPDATED

export default router;